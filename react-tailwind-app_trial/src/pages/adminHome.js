import Header from "../components/Header";
import AdminHome from "../components/AdminHome";
import configData from '../config.json';

export default function UserHomepage() {
    return (
        <>
            <Header
                heading={configData.AdminHome.Heading}
            />
            <AdminHome />
        </>
    )
}