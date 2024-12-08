## Getting started
```sh
pnpm i
pnpm run dev
```

## Updating config file schema based on Superchain Registry

```sh
pnpm update:all
```

## Generating local env file `.dev.vars`

```sh
pnpm generate:dev-vars
```

## Updating secrets

### When Superchain Registry is updated

1. update the bindings

```sh
pnpm update:all
```

2. update `rpc-url-secrets.json` file with any overrides

3. (optional) regenerate `.dev.vars` file for local development

```sh
pnpm generate:dev-vars
```

4. upload to Cloudflare

```sh
pnpm upload:rpc-secrets
```

### When updating a specific chain's RPC URL

Follow step 2,3,4 of the previous section

