# Botium Connector for for wit.ai

[![NPM](https://nodei.co/npm/botium-connector-witai.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-witai/)

[![Codeship Status for codeforequity-at/botium-connector-sapcai](https://app.codeship.com/projects/22e46100-911b-0137-ae8a-4e8cea91d933/status?branch=master)](https://app.codeship.com/projects/356365)
[![npm version](https://badge.fury.io/js/botium-connector-witai.svg)](https://badge.fury.io/js/botium-connector-witai)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for testing your wit.ai projects.

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works
Botium connects to your wit.ai using its [Wit Node.js SDK](https://github.com/wit-ai/node-wit). It extracts the NLP information for using with Botium and it's NLP asserters.

You can assert composite entities too:
```
INTENT <CompositeEntityName>.<EntityName>
```
or just
```
INTENT <CompositeEntityName>
```
and
```
INTENT_CONFIDENCE <CompositeEntityConfidence>
```

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

## Requirements
* **Node.js and NPM**
* a **wit.ai** app
* a **project directory** on your workstation to hold test cases and Botium configuration

## Install Botium and wit.ai Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-witai
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-witai
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting wit.ai app to Botium

Process is very simple, you just need the wit.ai server access token. After creating your app, you can find your access token in the app's Settings tab.

Create a botium.json with this URL in your project directory:

```
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "<whatever>",
      "CONTAINERMODE": "witai",
      "WITAI_TOKEN": "..."
    }
  }
}
```

Botium setup is ready, you can begin to write your [BotiumScript](https://github.com/codeforequity-at/botium-core/wiki/Botium-Scripting) files.

## How to start sample

There is a small demo in [samples](./samples) with Botium Bindings.

Install the packages, and run the test:
```
> cd ./samples/
> npm install && npm test
```

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __witai__ to activate this connector.

### WITAI_TOKEN
Get it from the app's Settings tab in the wit.ai console

### WITAI_CONTEXT
_Default: empty_

Context JSON object for wit.ai, see [here](https://wit.ai/docs/http/20170307#context_link) for details and format.

### WITAI_APIVERSION
_Default: empty_

The API version to use instead of the recommended one

## Open Issues and Restrictions
* For wit.ai the entity role is an alias for name. You can assert an entity just with alias:
```
INTENT <EntityRole>
```
* wit.ai supports 0, 1, or more intents for a utterance. But you can assert with Botium just one. 
