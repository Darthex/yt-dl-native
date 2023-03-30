import {StatusBar} from 'expo-status-bar';
import {Image, Keyboard, StyleSheet, Text, TextInput, TouchableHighlight, View, Platform, ActivityIndicator} from 'react-native';
import React from "react";
import {youtube_parser, filenameParser} from "./components/utils";
import axios from "axios";
import * as FileSystem from 'expo-file-system'
import {shareAsync} from "expo-sharing";

export default function App() {

    const [bool, setBool] = React.useState(true)
    const [bool2, setBool2] = React.useState(false)
    const [buttonBool, setButtonBool] = React.useState(false)
    const [downloadState, setDownloadState] = React.useState(0)

    const [videoLink, setVideoLink] = React.useState('')
    const [downloadLink, setDownloadLink] = React.useState('')
    const [title, setTitle] = React.useState('')
    const [thumbnail, setThumbnail] = React.useState('')

    async function handleDownload() {
        setDownloadState(1)
        const filename = title && filenameParser(title)
        const result = await FileSystem.downloadAsync(
            downloadLink,
            FileSystem.documentDirectory + filename
        )
        await saveToDevice(result.uri, filename, result.headers['content-type'])
    }

    async function saveToDevice(uri, filename, mimetype) {
        if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
            if (permissions.granted) {
                const base64 = await FileSystem.StorageAccessFramework.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64})
                await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
                    .then(async (uri) => {
                        await FileSystem.writeAsStringAsync(uri, base64, {encoding: FileSystem.EncodingType.Base64})
                        setDownloadState(2)
                    })
            }
        } else {
            await shareAsync(uri)
        }
    }

    function handleSearch() {
        setDownloadState(0)
        if (videoLink.length > 0) {
            setButtonBool(prevState => !prevState)
            Keyboard.dismiss()
            let video_id = youtube_parser(videoLink)
            axios({
                method: 'get',
                url: 'https://youtube-mp36.p.rapidapi.com/dl',
                params: {id: video_id},
                headers: {
                    'X-RapidAPI-Key': '2c5ffafad3msheaf63ada2e54a71p122146jsnfa80303c4eab',
                    'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
                }
            }).then((res) => {
                setDownloadLink(res.data.link)
                axios({
                    method: 'get',
                    url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
                    params: {id: video_id},
                    headers: {
                        'X-RapidAPI-Key': '2c5ffafad3msheaf63ada2e54a71p122146jsnfa80303c4eab',
                        'X-RapidAPI-Host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                    }
                }).then((res) => {
                    setThumbnail(res.data.thumbnail[res.data.thumbnail.length - 1].url)
                    setTitle(res.data.title)
                    setVideoLink('')
                    setButtonBool(prevState => !prevState)
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((error) => {
                alert('This link seems to be broken.\nTry Another')
            })
        } else {
            alert('Enter url first')
        }
    }


    return (
        <View style={styles.container}>
            {bool ?
                <View style={styles.div}>
                    <Text style={styles.header}>Youtube MP3</Text>
                    <Text style={styles.description}>How does it work? Just paste the url from your favourite youtube
                        video
                        into the input box and its
                        ready to download✨</Text>
                    <TouchableHighlight onPress={() => setBool(prevState => !prevState)}>
                        <View style={styles.button}>
                            <Image source={require('./assets/right-arrows.png')} style={styles.downloadImage}/>
                        </View>
                    </TouchableHighlight>
                </View>
                :
                <View style={styles.div2}>
                    <View style={styles.inputForm}>
                        <TextInput style={styles.input} placeholder='Enter Url...'
                                   onChangeText={(text) => setVideoLink(text)} defaultValue={videoLink}/>
                        <TouchableHighlight onPress={handleSearch} disabled={buttonBool}>
                            <View style={buttonBool ? [styles.button2, styles.button2Disabled] : styles.button2}>
                                <Text>{buttonBool ? 'Searching...' : 'Search'}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    {thumbnail &&
                        <View style={styles.imageContainer}>
                            <Image style={styles.image} source={{
                                uri: thumbnail
                            }}/>
                            {downloadState === 0 ?
                                <TouchableHighlight onPress={handleDownload} style={styles.download}>
                                    <Image source={require('./assets/download-white.png')}
                                           style={styles.downloadImage}/>
                                </TouchableHighlight>
                                :
                                downloadState === 1 ?
                                    <View style={styles.download}>
                                        <ActivityIndicator size="small" color="white" />
                                    </View>
                                    :
                                <View style={styles.download}>
                                <Image source={require('./assets/tick.png')}
                                       style={styles.downloadImage}/>
                                </View>
                            }

                        </View>
                    }
                    <Text style={styles.title}>{title}</Text>
                </View>
            }
            <StatusBar style="light"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    div: {
        marginTop: 70,
    },
    div2: {
        flex: 1,
        alignItems: 'center'
    },
    inputForm: {
        marginTop: 200,
        alignItems: 'center'
    },

    header: {
        color: 'white',
        fontSize: 30,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    description: {
        color: 'white',
        fontSize: 15
    },
    button: {
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignSelf: 'flex-end',
        marginTop: 50,
        justifyContent:'center',
        alignItems:'center'
    },
    button2: {
        width: 200,
        // height: 70,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        borderRadius: 20
    },
    button2Disabled: {
        backgroundColor: 'grey'
    },
    input: {
        width: 300,
        borderColor: 'white',
        borderWidth: 3,
        color: 'white',
        marginBottom: 20,
        borderRadius: 20,
        padding: 2,
        paddingHorizontal: 10
    },
    imageContainer: {
        marginTop: 100,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 336,
        height: 240,
        resizeMode: 'contain',
    },
    download: {
        width: 50,
        height: 50,
        borderRadius: 25,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    downloadImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    title: {
        marginTop: 15,
        color: 'white',
        fontSize: 10
    }
});
