# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

# How it works

On user register/login:

1. A `refresh token` is added to user's cookies as `jid`. It is set to expire after 7 days, and it gets renewed every time user hits `/refresh_token`.
2. An `access token` is returned from a GraphQL login/register mutation. It is set to expire after 15 minutes. This token gets passed through as an `Authentication header` in every request.
