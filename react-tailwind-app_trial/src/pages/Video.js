import Header from "../components/Header";
import VideoRecorder from "../components/Video";
import configData from '../config.json';

export default function Videopage() {
    return (
        <>
            <Header
                heading={configData.Video.Heading}
            />
            <VideoRecorder />
        </>
    )
}