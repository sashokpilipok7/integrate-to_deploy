# AZURE

## Steps to create a static website on Azure

1. Register on [Azure](https://azure.microsoft.com/en-us/).
2. Create a storage account on `Storage accounts` [Portal](https://portal.azure.com/#home).
<details>
  <summary>Click to expand</summary>

[![Image from Gyazo](https://i.gyazo.com/fe5200e939b1762c85dbd9ea0cf30aa6.png)](https://gyazo.com/fe5200e939b1762c85dbd9ea0cf30aa6)

</details>

3. Get Access Keys on `Access keys`.
<details>
  <summary>Click to expand</summary>

[![Image from Gyazo](https://i.gyazo.com/1f46623a355b342ceb95469c47d5a88b.png)](https://gyazo.com/1f46623a355b342ceb95469c47d5a88b)

</details>

4.  Enable Static website on `Static website`.

    4.1. Set `index.html` as Index document name.

    4.2. Set `404.html` as Error document path or leave it blank.
      <details>
        <summary>Click to expand</summary>

    [![Image from Gyazo](https://i.gyazo.com/99589554032b631d8920f470e844a22f.png)](https://gyazo.com/99589554032b631d8920f470e844a22f)

      </details>

    4.3. After save, you can see the endpoint URL.
    <details>
    <summary>Click to expand</summary>

        [![Image from Gyazo](https://i.gyazo.com/26b8a5f491d7afc69a1ddba7ff4c9184.png)](https://gyazo.com/26b8a5f491d7afc69a1ddba7ff4c9184)

      </details>

5.  After that, the container `$web` will automatically be created in which we will place folders with future sites.

  <details>
    <summary>Click to expand</summary>

[![Image from Gyazo](https://i.gyazo.com/d41022f7e8b76b9f1bf6df03e2994b73.png)](https://gyazo.com/d41022f7e8b76b9f1bf6df03e2994b73)

  </details>

### Values required for integration operation

- Api Keys (`Storage account name` and `Key`)
- Endpoints URL (two endpoints: `Primary endpoint` and `Secondary endpoint`)
- Container name (default: `$web`)

They are used 👉 [here](/src/clouds/azure/index.ts)

## API Gateway

**TEST Azure Keys**

```text
account = "dh11storage";
accountKey =
  "xlhxyuIxsjmzcZ+fCfoSH3yNvMEr0IIF67JBjOhGKOtw5QnKIBPWVRdVYeeQa5qn+Dsp/2dRGWxg+AStMTMpUQ==";
```

- **Request to endpoint `/verifyConnection`**

  Add to header `x-api-token: test`

_Example of body request:_

```json
{
  "service": "azure",
  "accessKey": "xlhxyuIxsjmzcZ+fCfoSH3yNvMEr0IIF67JBjOhGKOtw5QnKIBPWVRdVYeeQa5qn+Dsp/2dRGWxg+AStMTMpUQ==",
  "accountName": "dh11storage"
}
```

_Example of body response:_

```json
{
  "connectionInfo": {
    "verified": true
  },
  "service": "azure",
  "accessKey": "xlhxyuIxsjmzcZ+fCfoSH3yNvMEr0IIF67JBjOhGKOtw5QnKIBPWVRdVYeeQa5qn+Dsp/2dRGWxg+AStMTMpUQ==",
  "accountName": "dh11storage"
}
```
- **Request to endpoint `/sites`**

  Add to header `x-api-token: test`

_Example of body request:_

```json
{
  "service": "azure",
  "connection_key": "YOUR_AZURE_KEY",
  "connection_secret_key": "YOUR_SECRET_KEY",
  "site_id": "YOUR_SITE_ID",
  "connection_uniq_id": "YOUR_CONNECTION_UNIQ_ID",
  "account_name": "YOUR_ACCOUNT_NAME"
}
```
and zip file with `index.html` and others files

_Example of body response_ (when the site is in the database)

```json
{
  "message": "File updated successfully",
  "urls": [
    "https://dh11storage.z6.web.core.windows.net/649ebf3cbc59fcd59caca2cd",
    "https://dh11storage-secondary.z6.web.core.windows.net/649ebf3cbc59fcd59caca2cd"
  ]
}
```
