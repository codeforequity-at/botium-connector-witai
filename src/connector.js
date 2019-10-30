const util = require('util')
const _ = require('lodash')
const { log, Wit } = require('node-wit')
const debug = require('debug')('botium-connector-witai')

const Capabilities = {
  WITAI_TOKEN: 'WITAI_TOKEN',
  WITAI_CONTEXT: 'WITAI_CONTEXT',
  WITAI_APIVERSION: 'WITAI_APIVERSION'
}

class BotiumConnectorWITAI {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = caps
  }

  Validate () {
    if (!this.caps[Capabilities.WITAI_TOKEN]) throw new Error('WITAI_TOKEN capability required')

    this.context = null
    if (this.caps[Capabilities.WITAI_CONTEXT]) {
      if (_.isString(this.caps[Capabilities.WITAI_CONTEXT])) {
        try {
          this.context = JSON.parse(this.caps[Capabilities.WITAI_CONTEXT])
        } catch (err) {
          throw new Error('WITAI_CONTEXT capability parsing as JSON failed')
        }
      } else {
        this.context = this.caps[Capabilities.WITAI_CONTEXT]
      }
    }
  }

  Build () {
    const clientOptions = {
      accessToken: this.caps[Capabilities.WITAI_TOKEN]
    }
    if (debug.enabled) {
      clientOptions.logger = new log.Logger(log.DEBUG)
    }
    if (this.caps[Capabilities.WITAI_APIVERSION]) {
      clientOptions.apiVersion = this.caps[Capabilities.WITAI_APIVERSION]
    }
    this.client = new Wit(clientOptions)
    return Promise.resolve()
  }

  async UserSays (msg) {
    const data = await this.client.message(msg.messageText, this.context)
    debug(`UserSays: ${msg.messageText} => ${JSON.stringify(data)}`)

    const flatEntitiesArray = (name, entities, result, compositeEntityName) => {
      for (const entry of entities) {
        result.push(
          {
            name: compositeEntityName ? `${compositeEntityName}.${name}` : name,
            value: entry.value,
            confidence: entry.confidence
          }
        )
        entry.entities && flatEntitiesObject(entry.entities, result, name)
      }
    }
    const flatEntitiesObject = (entities, result = [], compositeEntityName = null) => {
      for (const name of Object.keys(entities)) {
        if (compositeEntityName || name !== 'intent') {
          flatEntitiesArray(name, entities[name], result, compositeEntityName)
        }
      }

      return result
    }
    const botMsg = {
      nlp: {
        intent: data.entities && data.entities.intent && data.entities.intent.length > 0 && {
          name: data.entities.intent[0].value,
          confidence: data.entities.intent[0].confidence,
          intents: data.entities.intent.map((intent) => { return { name: intent.value, confidence: intent.confidence } })
        },
        entities: flatEntitiesObject(data.entities)
      },
      sourceData: data
    }
    setTimeout(() => this.queueBotSays(botMsg), 0)
  }

  Clean () {
    this.client = null
    return Promise.resolve()
  }
}

module.exports = BotiumConnectorWITAI
