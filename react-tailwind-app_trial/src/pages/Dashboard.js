import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import configData from '../config.json';

export default function Dashboardpage() {
    return (
        <>
            <Header
                heading={configData.Dashboard.Heading}
            />
            <Dashboard />
        </>
    )
}