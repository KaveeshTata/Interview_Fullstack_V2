import Header from "../components/Header";
import AudioRecorder from "../components/Audio";
import configData from '../config.json';

export default function Audiopage() {
    return (
        <>
            <Header
                heading={configData.Audio.Heading}
            />
            <AudioRecorder />
        </>
    )
}