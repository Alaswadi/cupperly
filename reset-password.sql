-- Reset admin@demo.cupperly.com password to 'demo123'
UPDATE users
SET password = '$2a$10$QCuCzMu9ncLvpydZ/9Hk6u1F6wgTyJNGIgGppPr9WVbclGCHW1STm'
WHERE email = 'admin@demo.cupperly.com';

-- Show the result
SELECT email, role FROM users WHERE email = 'admin@demo.cupperly.com';

