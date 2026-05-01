const Alexa = require('ask-sdk-core');

const movies = {
    'project hail mary': "Project Hail Mary is incredible. Ryan Gosling wakes up alone in space with no memory of how he got there. Funny, emotional, and smart. 94% on Rotten Tomatoes. Just go see it.",
    'the mummy': "Lee Cronin's Mummy is straight up horror — not the fun Brendan Fraser kind. Rated R, actually scary. Good pick if that's what you're after.",
    'mario': "The Super Mario Galaxy Movie is out now, rated PG. Great for kids, pretty fun for adults who grew up on the games too.",
    'super mario': "The Super Mario Galaxy Movie is out now, rated PG. Great for kids, pretty fun for adults who grew up on the games too.",
    'the super mario galaxy movie': "The Super Mario Galaxy Movie is out now, rated PG. Great for kids, pretty fun for adults who grew up on the games too.",
    'the drama': "Zendaya and Robert Pattinson in a romantic drama. That casting alone is enough reason to go. Rated R.",
    'tuscany': "You Me and Tuscany is a light PG-13 rom-com. Nothing crazy but solid if you want something easy to watch.",
    'you me and tuscany': "You Me and Tuscany is a light PG-13 rom-com. Nothing crazy but solid if you want something easy to watch.",
    'normal': "Normal is a gritty R-rated action thriller. If you want something intense, this is the one.",
    'hoppers': "Hoppers is the new Pixar movie, rated PG. You already know how this goes — looks great, will probably make you cry. Works for any age.",
    'faces of death': "Faces of Death is rated R and not for the faint of heart. Dark and disturbing. You've been warned.",
    'busboys': "Busboys is an R-rated thriller. Tense and character-driven, worth checking out if you're into that.",
    'a great awakening': "A Great Awakening is a PG historical drama. Meaningful, solid pick if you want something with some weight to it.",
    'crime 101': "Crime 101 is an R-rated crime thriller. If you liked stuff like Knives Out or Heat, give it a shot.",
    'ready or not': "Ready or Not 2 is out now. The original was great so expectations are high. Rated R, horror sequel.",
    'ready or not 2': "Ready or Not 2 is out now. The original was great so expectations are high. Rated R, horror sequel."
};

const genres = {
    horror: ['The Mummy', 'Faces of Death', 'Ready or Not 2'],
    scifi: ['Project Hail Mary'],
    action: ['Normal', 'Crime 101', 'Busboys'],
    romance: ['The Drama', 'You Me and Tuscany'],
    animation: ['The Super Mario Galaxy Movie', 'Hoppers'],
    family: ['The Super Mario Galaxy Movie', 'Hoppers', 'A Great Awakening'],
    drama: ['The Drama', 'A Great Awakening'],
    thriller: ['Busboys', 'Crime 101', 'Normal']
};

const showtimes = ['2:00 PM', '4:45 PM', '7:30 PM', '10:05 PM'];

function findGenre(q) {
    if (/horror|scary|creepy|spooky|frightening/.test(q)) return 'horror';
    if (/sci.fi|space|science fiction|scifi/.test(q)) return 'scifi';
    if (/action|intense|adrenaline|fight/.test(q)) return 'action';
    if (/romance|romantic|love|date night|rom.com|comedy/.test(q)) return 'romance';
    if (/animated|animation|pixar|cartoon|kids movie/.test(q)) return 'animation';
    if (/family|kids|children/.test(q)) return 'family';
    if (/drama|emotional/.test(q)) return 'drama';
    if (/thriller|suspense|mystery/.test(q)) return 'thriller';
    return null;
}

function findMovie(q) {
    for (const key of Object.keys(movies)) {
        if (q.includes(key)) return key;
    }
    // fuzzy match — if exact fails, check if all meaningful words from the key appear in query
    for (const key of Object.keys(movies)) {
        const words = key.split(' ').filter(w => w.length > 3);
        if (words.length > 0 && words.every(w => q.includes(w))) return key;
    }
    return null;
}

const LaunchRequestHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'LaunchRequest';
    },
    handle(h) {
        return h.responseBuilder
            .speak("Hey, welcome to Movie Guru. Tell me a genre, a movie title, or just say surprise me.")
            .reprompt("What kind of movie are you looking for?")
            .getResponse();
    }
};

const GetMovieRecommendationIntentHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(h.requestEnvelope) === 'GetMovieRecommendationIntent';
    },
    handle(h) {
        const raw = Alexa.getSlotValue(h.requestEnvelope, 'MovieQuery');

        if (!raw || !raw.trim()) {
            return h.responseBuilder
                .speak("What are you in the mood for? Give me a genre or a movie title.")
                .reprompt("Genre or movie title, either works.")
                .getResponse();
        }

        const q = raw.toLowerCase();

        // vague request
        if (/surprise|anything|whatever|don't know|no idea|idk|something good/.test(q)) {
            return h.responseBuilder
                .speak("Three good picks right now: Project Hail Mary if you want the best movie in theaters, Hoppers if you want something for everyone, or The Drama if you're feeling a romantic night out.")
                .reprompt("Want details on any of those?")
                .getResponse();
        }

        // showtime request
        if (/showtime|playing|when is|what time|schedule/.test(q)) {
            const key = findMovie(q);
            if (key) {
                return h.responseBuilder
                    .speak(`${movies[key].split('.')[0]}. Showtimes today are ${showtimes.join(', ')}.`)
                    .reprompt("Anything else?")
                    .getResponse();
            }
            return h.responseBuilder
                .speak("Which movie are you trying to see? Give me a title and I'll pull the times.")
                .reprompt("Which movie?")
                .getResponse();
        }

        // specific movie
        const key = findMovie(q);
        if (key) {
            return h.responseBuilder
                .speak(movies[key] + " Want the showtimes?")
                .reprompt("Want showtimes?")
                .getResponse();
        }

        // genre
        const genre = findGenre(q);
        if (genre) {
            return h.responseBuilder
                .speak(`Here's what's playing in ${genre} right now: ${genres[genre].join(', ')}. Want to know more about any of them?`)
                .reprompt("Want details on any of those?")
                .getResponse();
        }

        // nothing matched
        return h.responseBuilder
            .speak(`Couldn't find anything for "${raw}". Try a genre like horror or sci-fi, or just name a specific movie.`)
            .reprompt("What genre or movie are you looking for?")
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(h) {
        return h.responseBuilder
            .speak("Try asking for a genre like horror or sci-fi, or name a specific movie like Project Hail Mary or Hoppers. You can also ask for showtimes.")
            .reprompt("What can I help you find?")
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(h) {
        return h.responseBuilder.speak("Enjoy the movie!").getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(h) {
        return h.responseBuilder
            .speak("Didn't catch that. Try a genre or a movie title.")
            .reprompt("What are you in the mood for?")
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(h) {
        return Alexa.getRequestType(h.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(h) {
        return h.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() { return true; },
    handle(h, error) {
        console.log('Error:', error.message);
        return h.responseBuilder
            .speak("Something broke on my end. Try again.")
            .reprompt("Try a genre or movie title.")
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetMovieRecommendationIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();