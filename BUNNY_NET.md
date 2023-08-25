# Bunny.net

## Bunny.net provides a full API service for all services and products. The developer hub is a collection of information and documentation to help you use and configure these as easily as possible.

[Documentation](https://docs.bunny.net/docs)

## Official API Clients

The official library for node.js does not exist.

## Steps to use integration

1. Create an account on [Bunny.net](https://bunny.net).
2. Get your API key from the [Settings](https://dash.bunny.net/account/settings) page.
3. The basic configuration [is here](/src/clouds/bunny.net/index.ts).

## API Gateway

> Previous integration (AWS) is not touched

**Test BUNNY_NET_KEY**

```text
fb604e9a-da17-47e3-b4f2-632306276e48fb0a4ca5-73ea-4d5d-ab8e-a94aa6d990df
```

- **Request to endpoint `/verifyConnection`**

  Add to header `x-api-token: test`

_Example of body request:_

```json
{
  "service": "bunny.net",
  "accessKey": "YOUR_BUNNY_NET_KEY"
}
```

_Example of body response:_

```json
{
  "connectionInfo": {
    "verified": true
  },
  "service": "bunny.net",
  "accessKey": "YOUR_BUNNY_NET_KEY"
}
```

- **Request to endpoint `/sites`**

  Add to header `x-api-token: test`

_Example of body request:_

```json
{
  "service": "bunny.net",
  "connection_key": "YOUR_BUNNY_NET_KEY",
  "connection_secret_key": "YOUR_SECRET_KEY",
  "connection_region": "de",
  "zoneTier": 1,
  "site_id": "YOUR_SITE_ID",
  "connection_uniq_id": "YOUR_CONNECTION_UNIQ_ID",
  "type": 1
}
```
and zip file with `index.html` and others files

_Example of body response_ (when the site is in the database)

```json
{
    "message": "File updated successfully",
    "urls": [
        "https://sc-649a8414fe7336d70f4ad582-pull-zone.b-cdn.net"
    ]
}
```

