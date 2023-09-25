import Header from "../components/Header";
import UserHome from "../components/UserHome";
import configData from '../config.json';

export default function UserHomepage() {
    return (
        <>
            <Header
                heading={configData.UserHome.Heading}
            />
            <UserHome />
        </>
    )
}