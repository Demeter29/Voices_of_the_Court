export function cleanMessageContent(messageText: string){
    //TODO: remove [] brackets and the content inside it.

    //remove emojis
    messageText = messageText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    //TODO: remove 'as an XY,'

    return messageText;
}