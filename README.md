# [Backstage](https://backstage.io)

To start the app, run:

```sh
yarn install
yarn dev
```

To start the app using `podman` or `docker`, with the development profile (omit the --config for production)

```sh
podman run \
    -it --rm \
    -p 7007:7007 \
    --entrypoint node \
    --name backstage-parodos \
    quay.io/parodos-dev/backstage-parodos \
    packages/backend --config /app/app-config.yaml
```

## Local development

The Parodos username is `test`, password `test`.

## Distribution

### NPM Package

To create an NPM package that can be installed via vendored dependencies, run `./scripts/build-frontend.sh`. This will generate `success Wrote tarball to ".../plugins/parodos/parodos-plugin-parodos-v0.1.0.tgz".` which gives you path to the generated `.tgz` file.

### Docker image

To create a Docker image, run `./scripts/build-image.sh`. This will build a container and tag it with `backstage` you can push this image into the registry. For more information, checkout https://backstage.io/docs/deployment/docker
