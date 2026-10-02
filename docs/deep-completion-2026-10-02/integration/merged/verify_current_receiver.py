"""Linked producer contract against real ASGI auth/intake and guarded temp SQLite.
No app server, application edits, providers or dependency overrides.
"""
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
GUARD = HERE.parents[1] / 'cockpitcloud/review/verify_core_offline.py'
INPUT = HERE.parents[3] / '.worktrees/companysite-unified-inquiry-2026-09-24/output/receiver-contract/producer-capture.json'
# Reuse exactly the existing guard/controls/isolation prefix, not a relaxed copy.
guard_source = GUARD.read_text(encoding='utf-8')
prefix = guard_source.split('# Read-only native qualification.', 1)[0]
assert "sys.addaudithook(audit)" in prefix and "original_config(env_file=None" in prefix
sys.argv = [str(GUARD), 'integration']
guard = {'__file__': str(GUARD), '__name__': 'receiver_contract_guard'}
exec(compile(prefix, str(GUARD), 'exec'), guard)
scratch, ROOT = guard['scratch'], guard['ROOT']
guard['socket'].has_ipv6 = False

import json
import hashlib
import base64
import hmac
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from Backend.main import app
from Backend.db import SessionLocal, init_db, engine
from Backend.auth import decode_token
from Backend.models import User, Lead, LeadReceipt, LeadDelivery
from Backend import lead_delivery

capture = json.loads(INPUT.read_text(encoding='utf-8'))
assert capture['mode'] == 'capture' and len(capture['cases']) == 2
compiled = INPUT.parents[1] / 'runtime/index.js'
assert hashlib.sha256(compiled.read_bytes()).hexdigest() == capture['worker_sha256']
def encoded(value):
    return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).decode().rstrip('=')
unsigned = encoded({'alg': 'HS256', 'typ': 'JWT'}) + '.' + encoded({'sub':capture['owner'], 'iat':capture['issued'], 'exp':capture['expires']})
key = ('synthetic-test-only-' + 'x' * 50).encode()
token = unsigned + '.' + base64.urlsafe_b64encode(hmac.new(key, unsigned.encode(), hashlib.sha256).digest()).decode().rstrip('=')
authorization = 'Bearer ' + token
assert hashlib.sha256(authorization.encode()).hexdigest() == capture['authorization_sha256']
assert decode_token(token) == capture['owner']
assert not app.dependency_overrides, 'Use actual auth and database dependencies'

def counts():
    with SessionLocal() as db:
        return [db.query(model).count() for model in (Lead, LeadReceipt, LeadDelivery)]

checks = []
results = []
with TestClient(app) as client:
    with SessionLocal() as db:
        db.add(User(id=capture['owner'], email='contract-owner@example.invalid', password_hash='synthetic-not-a-login'))
        db.commit()
    assert counts() == [0, 0, 0]
    for index, case in enumerate(capture['cases']):
        wire = case['outbound']
        assert wire['authorization_sha256'] == capture['authorization_sha256']
        assert wire['url'] == 'https://cockpit.example.invalid/v1/leads/ingest'
        assert wire['headers']['Idempotency-Key'] == 'companysite:' + case['id']
        headers = {**wire['headers'], 'Authorization': authorization}
        payload = json.loads(wire['body'])
        # No authentication override: the same signed synthetic Bearer wire header
        # passes the real current_user dependency and temp database user lookup.
        assert client.post('/v1/leads/ingest', content=wire['body'], headers=wire['headers']).status_code == 401
        assert client.post('/v1/leads/ingest', content=wire['body'], headers={**headers, 'Authorization':'Bearer invalid'}).status_code == 401
        created = client.post('/v1/leads/ingest', content=wire['body'], headers=headers)
        assert created.status_code == 201, created.text
        body = created.json()
        assert body['notifications'] == ['acknowledgment_email', 'operator_email']
        assert sorted(row['channel'] for row in body['deliveries']) == body['notifications']
        assert all(row['state'] == 'pending' and row['attempts'] == 0 for row in body['deliveries'])
        for field, value in payload.items():
            assert body[field] == value, (case['name'], field)
        replay = client.post('/v1/leads/ingest', content=wire['body'], headers=headers)
        assert replay.status_code == 200 and replay.json() == body
        assert counts() == [index + 1, index + 1, (index + 1) * 2]
        with SessionLocal() as db:
            receipt = db.get(LeadReceipt, body['id'])
            assert receipt.user_id == capture['owner']
            assert receipt.idempotency_key == wire['headers']['Idempotency-Key']
            assert json.loads(receipt.context_json) == payload['context']
            jobs = db.query(LeadDelivery).filter_by(lead_id=body['id']).all()
            assert len(jobs) == 2
            for job in jobs:
                snap = json.loads(job.payload_json)
                assert snap['context'] == payload['context'] and snap['message'] == payload['message']
                assert snap['source'] == 'companysite' and job.source == 'companysite'
        conflict = client.post('/v1/leads/ingest', json={**payload, 'message': 'Different synthetic inquiry content.'}, headers=headers)
        assert conflict.status_code == 409
        changed_plan = client.post('/v1/leads/ingest', json={**payload, 'notifications':['workflow']}, headers=headers)
        assert changed_plan.status_code == 409
        assert counts() == [index + 1, index + 1, (index + 1) * 2]
        results.append({'name':case['name'], 'key':wire['headers']['Idempotency-Key'], 'id':body['id'],
                        'responses':[{'name':'created','status':created.status_code,'body':body},
                                     {'name':'replayed','status':replay.status_code,'body':replay.json()},
                                     {'name':'conflict','status':conflict.status_code,'body':conflict.json()}]})
        checks.append({'case':case['name'], 'auth':'actual JWT/current_user, no overrides', 'create':201,'replay':200,
                       'changed_content':409,'changed_plan':409, 'counts':counts(), 'context_and_roles_preserved':True})
    # Record failed/uncertain outcomes via actual transport-free service commits.
    # No worker/provider is activated; effect attempts are deliberately simulated.
    at = datetime.now(timezone.utc) + timedelta(seconds=1)
    jobs_before = {}
    with SessionLocal() as db:
        for row in db.query(LeadDelivery).all(): jobs_before[row.id] = row.payload_json
    for number in range(4):
        with SessionLocal() as db:
            row = lead_delivery.claim_next(db, capture['owner'], now=at)
            assert row is not None
            request = json.dumps({'body':'Synthetic request snapshot only','channel':row.channel}, sort_keys=True, separators=(',', ':'))
            assert lead_delivery.pin_target(db, capture['owner'], row.id, row.claim_token, 'a'*64, now=at, request_json=request)
            outcome = 'failed' if number % 2 == 0 else 'uncertain'
            error = 'provider_rejected' if outcome == 'failed' else 'transport_uncertain'
            assert lead_delivery.finish(db, capture['owner'], row.id, row.claim_token, outcome=outcome, error=error, now=at)
    # New sessions after dispose exercise persisted state, not ORM objects/cache.
    engine.dispose()
    with SessionLocal() as db:
        assert lead_delivery.claim_next(db, capture['owner'], now=at + timedelta(days=1)) is None
        rows = db.query(LeadDelivery).all()
        assert sorted(row.state for row in rows) == ['failed','failed','uncertain','uncertain']
        for row in rows:
            assert row.payload_json == jobs_before[row.id]
            assert row.attempts == 1 and row.claim_token is None
            assert row.target_hash == 'a'*64 and row.request_json
    listing = client.get('/v1/leads', headers={'Authorization':authorization})
    assert listing.status_code == 200 and listing.json()['count'] == 2
    for case, result in zip(capture['cases'], results):
        replay = client.post('/v1/leads/ingest', content=case['outbound']['body'], headers={**case['outbound']['headers'], 'Authorization':authorization})
        assert replay.status_code == 200 and replay.json()['id'] == result['id']
        assert any(row['state'] in {'failed','uncertain'} for row in replay.json()['deliveries'])
        result['responses'].append({'name':'recoverable_outbox','status':200,'body':replay.json()})
    assert counts() == [2, 2, 4]
    checks.append({'scenario':'persisted failed/uncertain outbox', 'counts':counts(), 'auto_retry':False,
                   'payloads_preserved':True,'readable_by_owner':True,'actual_provider_attempts':0})

assert guard['events'] == [], guard['events']
source = ['Backend/main.py','Backend/auth.py','Backend/config.py','Backend/db.py','Backend/routes_leads.py','Backend/models.py','Backend/schemas.py','Backend/lead_delivery.py']
proof = {'checkedAt':datetime.now(timezone.utc).isoformat(), 'cases':results,'checks':checks,
         'controls':guard['controls'],'violations':guard['events'], 'counts':[2,2,4],
         'capture_sha256':hashlib.sha256(INPUT.read_bytes()).hexdigest(),
         'source_sha256':{path:hashlib.sha256((ROOT/path).read_bytes()).hexdigest() for path in source},
         'guard_sha256':hashlib.sha256(GUARD.read_bytes()).hexdigest(),
         'guard_reuse':'Unchanged prefix before import pytest; all10 controls and isolation applied.',
         'runner_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
         'python':sys.version.split()[0], 'temporary_database':True,'productionVerified':False,
         'limits':'Actual ASGI/JWT/SQLite intake and service; transport-free synthetic state transitions. Linked files, no simultaneous socket bridge, server, real data or provider delivery.'}
(scratch/'contract-proof.json').write_text(json.dumps(proof,indent=2),encoding='utf-8')
print('PROOF=' + str(scratch/'contract-proof.json'))
print('PASS actual auth/ASGI/SQLite contract:2 inquiries,2 receipts,4 recoverable jobs;10 boundary controls;zero violations.')
