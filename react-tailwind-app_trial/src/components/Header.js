import { Link } from 'react-router-dom';
import configData from '../config.json';
import '../App.css'

export default function Header({
    heading,
    paragraph,
    linkName,
    linkUrl = "#"
}) {
    return (
        <div className="mb-10">
            <div className="flex justify-center">
                <img src={configData.LogoSource} alt={configData.LogoAlt} border="0" width={configData.LogoWidth} />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
                {heading}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 mt-5">
                {paragraph} {' '}
                <Link to={linkUrl} className="font-medium text-purple-600 hover:text-purple-500">
                    {linkName}
                </Link>
            </p>
        </div>
    )
}