/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Reel Talk. You can ask me to find a certain genre of movie';
        const repromptText = 'Try saying, find me an action movie.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const movieDB = {
      action: [
        { title: "John Wick", time: "6:30 PM", theater: "Regal Hilltop" },
        { title: "Mad Max", time: "8:00 PM", theater: "AMC Vancouver" },
        { title: "Mission Impossible", time: "9:15 PM", theater: "Cinemark 23" }
      ],
      comedy: [
        { title: "Barbie", time: "5:45 PM", theater: "AMC Vancouver" },
        { title: "Free Guy", time: "7:10 PM", theater: "Regal Cascade" }
      ],
      horror: [
        { title: "The Conjuring", time: "9:30 PM", theater: "Cinemark 23" },
        { title: "Smile", time: "10:15 PM", theater: "AMC Vancouver" }
      ]
    };

const GetMovieInfoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetMovieInfoIntent';
  },

  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const genre = slots && slots.Genre && slots.Genre.value;

    if (!genre) {
      return handlerInput.responseBuilder
        .speak('What genre of movie would you like? You can say action, comedy, or horror.')
        .reprompt('Try saying action, comedy, or horror.')
        .getResponse();
    }

    let lowerGenre = genre.toLowerCase().trim();

    lowerGenre = lowerGenre
      .replace(/^(a |an |the |some )/, '')
      .replace(/ movie$/, '')
      .replace(/ movies$/, '');
      

    const movies = movieDB[lowerGenre];

    let speakOutput;

    if (!movies) {
      speakOutput = `I heard ${genre}, but I don’t have that genre yet. Try action, comedy, or horror.`;
    } else {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
      sessionAttributes.lastGenre = lowerGenre;
      sessionAttributes.movieOptions = movies;
    
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
      const movieList = movies.map((movie, index) =>
        `Option ${index + 1}: ${movie.title}<break time="0.5s"/>`
      ).join(' ');
    
      speakOutput = `<speak>Here are some ${lowerGenre} movies: ${movieList}. Which one would you like?</speak>`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('Which movie would you like? You can say the movie title, or say the first one.')
      .getResponse();
  }
};

function choiceToIndex(choice) {
  if (!choice) return -1;

  const lower = choice.toLowerCase();

  if (lower.includes('1') || lower.includes('one') || lower.includes('first')) return 0;
  if (lower.includes('2') || lower.includes('two') || lower.includes('second')) return 1;
  if (lower.includes('3') || lower.includes('three') || lower.includes('third')) return 2;

  return -1;
}

const ChooseMovieIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChooseMovieIntent';
  },

  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const movieChoice = slots.MovieTitle && slots.MovieTitle.value;
    const selection = slots.Selection && slots.Selection.value;

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const movieOptions = sessionAttributes.movieOptions || [];

    if (movieOptions.length === 0) {
      return handlerInput.responseBuilder
        .speak('Let’s start with a genre. You can say action, comedy, or horror.')
        .reprompt('Say a genre like action, comedy, or horror.')
        .getResponse();
    }
    
    if (!movieChoice && !selection) {
      return handlerInput.responseBuilder
        .speak('Which movie would you like? You can say the title, or say option one.')
        .reprompt('Say the movie title, or say option one.')
        .getResponse();
    }

    let selectedMovie;

    if (movieChoice) {
      const lowerChoice = movieChoice.toLowerCase();

      selectedMovie = movieOptions.find(movie =>
        movie.title.toLowerCase() === lowerChoice
      );
    }
    
    if (!selectedMovie) {
      const index = choiceToIndex(movieChoice || selection);
      selectedMovie = movieOptions[index];
    }

    if (!selectedMovie) {
      return handlerInput.responseBuilder
        .speak(`I heard ${movieChoice || selection}, but that was not one of the options. Please choose one of the movies listed.`)
        .reprompt('You can say the movie title, option one, or option two.')
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(`${selectedMovie.title} is playing at ${selectedMovie.theater} at ${selectedMovie.time}.`)
      .getResponse();
  }
};
        
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        GetMovieInfoIntentHandler,
        ChooseMovieIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();