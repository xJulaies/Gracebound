# Local ERDB source

The public ERDB API domain was unavailable when this integration was
implemented. Run the pinned official ERDB API container locally instead.

Start Docker Desktop and wait until its engine is running. Then execute:

```bash
docker run --rm --name gracebound-erdb -p 127.0.0.1:8107:8107 ghcr.io/eldenringdatabase/erdb-api:0.4.0
```

The container precaches every supported version before accepting HTTP
requests. Keep that terminal open and wait for this line:

```text
Uvicorn running on http://0.0.0.0:8107
```

Starting the import before this line can fail even though port `8107` is
already open.

In a second terminal, import the configured game version into MongoDB Atlas:

```bash
npm run data:import
```

The importer requests only the raw tables required for weapon attack rating:

- `armaments`
- `reinforcements`
- `correction-attack`
- `correction-graph`

It validates and maps all responses before opening the MongoDB connection.
`ERDB_BASE_URL` defaults to `http://127.0.0.1:8107/v1` and
`SUPPORTED_GAME_VERSION` defaults to `1.10.0`.

`MONGODB_URL` must select the `gracebound` database explicitly:

```text
mongodb+srv://<user>:<password>@<cluster>/gracebound?retryWrites=true&w=majority
```

Do not commit the real URI. The import uses a transaction and therefore
requires a replica-set deployment such as MongoDB Atlas. A standalone local
MongoDB instance is not supported by this import command.

The imported normalized collections are:

- `weapons`
- `reinforcementData`
- `scalingCurves`

Stop the ERDB container with `Ctrl+C` after the import. The `--rm` option
removes the stopped container automatically.
