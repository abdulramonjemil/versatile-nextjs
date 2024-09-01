<!-- @todo starter::Read this readme -->

# External files outside Next.js

This is meant to house files that are meant for use outside Next.js. This is
necessary because some Next.js specific-features might cause errors when using
them outside Next.js. An example of that is the `server-only` package which
causes files to error when not imported by bundlers as a react-server file.
Things to note:

- The directory is expected to be minimal, and files should be for Node.js.
- Should only contain code needed to run scripts/configs e.g. migrations.
- It's fine to reimplement something in the main project code (if that's
  needed). Just keep it minimal.

## TypeScript

If there's a reason not to use TypeScript later on, e.g. a tooling doesn't
support TS imports, we can just update `tsconfig.json` in this directory to
files to `external/dist` to use with the tool. In that case, we might have to
ignore this directory from the root `tsconfig`. For now though, there's no need
for that.
