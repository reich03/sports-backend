UPDATE users 
SET password = '$2a$10$Bd4.OX0lUgxPRHy/oDBguuf.sGpwSnzca9HcFZfZF0nuIAihYdIW6' 
WHERE email = 'admin@mastersport.app';

SELECT email, username, LEFT(password, 30) as pwd_check 
FROM users 
WHERE email = 'admin@mastersport.app';
