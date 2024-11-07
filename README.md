# SFIBlues Metocean Portal

Web Portal deployed to https://sintef.github.io/blues-metocean-portal/

Funded by the [SFI Blues](https://sfiblues.no/) project

The portal demonstrates the use of the [metocean-api](https://metocean-api.readthedocs.io/) and [metocean-stats](https://metocean-stats.readthedocs.io/) python libraries from [Norwegian Meteorological Institute](https://www.met.no/en) as well as integration towards [SIMA](https://sima.sintef.no/)


## Prerequisites

In order to run the commands described below, you need:
- node [https://nodejs.org/]

## Development

```Shell
npm run install
```

## Running 

For local development you can use

```Shell
npm run start
```

Then visit [http://localhost:3000] in your web browser to test the site

To build the site use

```Shell
npm run build
```

## Deployment

The site is deployed using a github workflow. 
See .github\workflows\deploy_page.yml

