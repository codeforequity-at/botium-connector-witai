const path = require('path')
const _ = require('lodash')
const randomize = require('randomatic')
const request = require('request-promise-native')
const botium = require('botium-core')
const debug = require('debug')('botium-connector-witai-nlp')

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

const getCaps = (caps) => {
  const result = Object.assign({}, caps || {})
  result.CONTAINERMODE = path.resolve(__dirname, '..', 'index.js')
  return result
}

const extractIntentUtterances = async ({ caps }) => {
  const driver = new botium.BotDriver(getCaps(caps))

  const getIntentsRequestOptions = {
    method: 'GET',
    uri: 'https://api.wit.ai/entities/intent?v=20160526',
    headers: {
      Authorization: `Bearer ${driver.caps.WITAI_TOKEN}`
    },
    json: true
  }

  const witIntentsList = await request(getIntentsRequestOptions)
  debug(`Wit.ai app got intents: ${JSON.stringify(witIntentsList, null, 2)}`)

  const intents = []
  for (const intent of (witIntentsList.values || [])) {
    const intentName = intent.value
    const utterances = intent.expressions || []
    intents.push({
      intentName,
      utterances
    })
  }
  return {
    intents,
    origIntentsList: witIntentsList
  }
}

const trainIntentUtterances = async ({ caps }, intents, { origIntentsList }) => {
  const driver = new botium.BotDriver(getCaps(caps))

  const newAppData = {
    name: `Botium-TrainingCopy-${randomize('Aa0', 5)}`,
    lang: (origIntentsList && origIntentsList.lang) || driver.caps.WITAI_LANG,
    private: true
  }

  const postAppDataRequestOptions = {
    method: 'POST',
    uri: 'https://api.wit.ai/apps?v=20160526',
    headers: {
      Authorization: `Bearer ${driver.caps.WITAI_TOKEN}`
    },
    body: newAppData,
    json: true
  }

  const newAppResponse = await request(postAppDataRequestOptions)
  debug(`Wit.ai created app: ${JSON.stringify(newAppResponse, null, 2)}`)

  for (const intent of intents || []) {
    await request({
      method: 'POST',
      uri: 'https://api.wit.ai/entities/intent/values?v=20160526',
      headers: {
        Authorization: `Bearer ${newAppResponse.access_token}`
      },
      body: {
        value: intent.intentName,
        expressions: intent.utterances
      },
      json: true
    })
    debug(`Wit.ai created intent: ${intent.intentName}`)
  }

  while (true) {
    const sampleUtterance = _.sample(_.sample(intents).utterances)
    const textResponse = await request({
      method: 'GET',
      uri: `https://api.wit.ai/message?v=20160526&q=${encodeURIComponent(sampleUtterance)}`,
      headers: {
        Authorization: `Bearer ${newAppResponse.access_token}`
      },
      json: true
    })
    if (textResponse.entities.intent) break
    debug(`Wit.ai waiting for sample query to return intent (last utt: ${sampleUtterance})`)
    await timeout(2000)
  }
  debug('Wit.ai training ready')

  return {
    caps: Object.assign({}, getCaps(caps), {
      WITAI_TOKEN: newAppResponse.access_token
    }),
    origIntentsList,
    tempApp: newAppResponse
  }
}

const cleanupIntentUtterances = async ({ caps }, { caps: trainCaps, origIntentsList, tempApp }) => {
  console.log('Wit.ai workspace deletion not supported, please remove all Wit.ai apps \'Botium-TrainingCopy-*\'')
}

module.exports = {
  extractIntentUtterances,
  trainIntentUtterances,
  cleanupIntentUtterances
}
