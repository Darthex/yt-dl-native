export function youtube_parser(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11) ? match[7] : false
}

export function filenameParser(name) {
    return name.replace(/[\/:*?"<>|／]/g, '-')
}
