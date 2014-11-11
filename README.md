# Tally
Super-basic usage stats management.

## Adding usage data
Adding usage data is done by sending a POST to the `/api/usages` endpoint with a JSON payload:

```sh
# curl -X POST \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Token token=xxxxxx' \
      -d '{"customer_id": "abc123", "from": "en", "to": "es", "text": "Hello World!"}' \
      https://tally.firma8.com/api/usages
```

## Querying usage data
For now, the query interface is limited to summary information.  Available arguments:

`customer_id`, `start_date`, `end_date`, `from`, `to`

Simply execute a GET to `/api/usages/summary`:

```sh
# curl -X GET \
       -H 'Accept: application/json' \
       -H 'Authorization: Token token=xxxxxx' \
       https://tally.firma8.com/api/usages/summary?start_date=2014-10-01
```

If no arguments are supplied, summary data for all customers is returned for the current calendar month.
Data is returned in JSON format:

```json
{
    "start_date": "2014-11-01T00:00:00-05:00",
    "end_date": "2014-11-17T00:00:00-05:00",
    "usages": [
        { "customer_id": "12345", "requests": 7, "token_count": 43 }
    ]
}
```

## Authentication
Requests are authenticated using the `Authorization` request header.  This header needs to contain a valid [auth](https://auth.sovee.com) token, in the format:

```
Token token=<auth token here>
```
