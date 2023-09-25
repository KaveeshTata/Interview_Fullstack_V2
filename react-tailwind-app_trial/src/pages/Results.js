import Header from "../components/Header";
import Results from "../components/Results";
import configData from '../config.json';

export default function Resultspage() {
    return (
        <>
            <Header
                heading={configData.Results.Heading}
                linkName="Back to Home"
                linkUrl="/userhome"
            />
            <Results />
        </>
    )
}