import { email } from '../data/resume.json';

export { email as contactEmail };
export const [emailUser, emailHost] = email.split('@');
