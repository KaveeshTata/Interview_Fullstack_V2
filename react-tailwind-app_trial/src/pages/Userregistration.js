import Header from "../components/Header";
import Userregistration from "../components/Userregistration";
import configData from '../config.json';

export default function UserregistrationPage() {
    return (
        <>
            <Header
                heading={configData.UserRegistration.Heading}
            />
            <Userregistration />
        </>
    )
}