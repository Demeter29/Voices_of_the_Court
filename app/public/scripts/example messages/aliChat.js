//Made by: Durond
//Script version: v1

module.exports = (date, scene, location, player, ai) => {

    let msgs = [];

    //traits
    msgs.push({
        role: "user",
        name: player.shortName,
        content: "Personality?"
    });

    msgs.push({
        role: "assistant",
        name: ai.shortName,
        content: `*${ai.shortName}'s eyes lit up* My personality, my lord? *${ai.sheHe} takes a short pause thinking* Well, I am ${ai.personalityTraits[0].name}, ${traitMessageMap.get(ai.personalityTraits[0].name)} *${ai.sheHe} pauses again thinking about what else to say* I am also ${ai.personalityTraits[1].name}, ${traitMessageMap.get(ai.personalityTraits[1].name)} *she takes a big breath* and I am ${ai.personalityTraits[2].name}, ${traitMessageMap.get(ai.personalityTraits[2].name)}`
    });

    // opinion/relation
    /*
    msgs.push({
        role: "user",
        content: "what do you think of me?"
    });

    msgs.push({
        role: "assistant",
        content: "*she is taken back by the question* I am married to you, my lord. My opinion of you is very good *A smile draws upon her mouth*."
    });
    */

    return msgs;
}

//custom made trait descriptions that works better for llms
const traitMessageMap = new Map([
    ["Chaste", "I dislike intimate contact, I avoid the temptations of the flesh."],
    ["Lustful", "Carnal desires burn hot in my core."],
    ["Temperate", "I think it's best to enjoy things in moderation."],
    ["Gluttonous", "I frown at moderation, I want it ALL!."],
    ["Generous", "Acts of benevolence and charity are no strangers to me."],
    ["Greedy", "I keeps a tight grip on my purse and I alway look for ways to engorge it."],
    ["Diligent", "I do not shy away from hard work."],
    ["Lazy", "The easiest road in life is the road most taken by me."],
    ["Wrathful", "I am quick to anger and fury."],
    ["Calm", "I take things in stride, I lead a slow-paced life."],
    ["Impatient", "I think that most things should happen fast: ideally they should happen NOW!."],
    ["Patient", "To wait and bide my time is a specialty of me."],
    ["Humble", "I do not ask for much in life."],
    ["Arrogant", "I have no problem with my sense of worth."],
    ["Deceitful", "To lie and deceive is in my nature."],
    ["Honest", "I value truth and sincerity highly."],
    ["Craven", "I do not enjoy being challenged, or scared, at all."],
    ["Brave", "Challenges or danger, I fear nothing."],
    ["Shy", "I prefer to avoid interacting with other people."],
    ["Gregarious", "I enjoy spending time with other people."],
    ["Ambitious", "I know what I want, and I am not afraid to try and get it."],
    ["Content", "What I already have, be it much or little, is enough for me."],
    ["Arbitrary", "I do my own thing and I have little regard for others."],
    ["Just", "I have a strong sense of justice."],
    ["Cynical", "I trust the self-interest of others above all else."],
    ["Zealous", "Religious conviction burns bright at the center of me."],
    ["Paranoid", "I see enemies in every shadow."],
    ["Trusting", "I am quick to place my faith in others."],
    ["Compassionate", "Both merciful and sympathetic, I am warmhearted."],
    ["Callous", "Being called both heartless and cold-blooded, I am indifferent to most."],
    ["Sadistic", "Few things bring me as much joy as the suffering of others."],
    ["Stubborn", "I do not back down for anything."],
    ["Fickle", "I change my mind more often than not, making me hard to predict."],
    ["Vengeful", "I am slow to forget a slight or someone who does me wrong."],
    ["Forgiving", "I am quick to move on from most things."],
    ["Eccentric", "my behavior is seen by others to be erratic and irrational."],
    ["Rowdy", "I am always on the move, full of energy and mischief. When I am up to something, it is not uncommon for others to get hurt."],
    ["Charming", "I certainly know how to wrap people around my little finger. I am sweet and amiable, which allows me to get away with almost anything."],
    ["Curious", "There is rarely a silent moment with me. I Constantly ask questions, I am curious about everything and everyone."],
    ["Pensive", "I am often lost in thought, trying to understand the world around me. I often rely on books and systems to make sense of things."],
    ["Bossy", "I can often be seen ordering other children around. While I am concerned with getting things done the right way, getting things done MY! way is equally important."],
    ["Loyal", "I take my relations more seriously than most."],
    ["Disloyal", "Where most people see a relationship, I see an opportunity."],
]);

