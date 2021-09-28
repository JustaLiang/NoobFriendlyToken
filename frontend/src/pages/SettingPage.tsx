import React from 'react'
import { useState, useCallback } from 'react'
import { create } from 'ipfs-http-client'
import InitStep from '../components/InitStep'
const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

interface Props {

}

function SettingPage(props: Props) {
    const [fileList, setFileList] = useState<FileList>();
    const [jsonList, setJsonList] = useState<FileList>();
    const [fileUrl, setFileUrl] = useState<string[]>([]);
    const imageUploader = useCallback((node: HTMLInputElement) => {
        if (!node) return;
        node.setAttribute('webkitdirectory', '');
        node.setAttribute('directory', '');
        node.setAttribute('multiple', '');
    }, []);
    const jsonUploader = useCallback((node: HTMLInputElement) => {
        if (!node) return;
        node.setAttribute('webkitdirectory', '');
        node.setAttribute('directory', '');
        node.setAttribute('multiple', '');
    }, []);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        console.log(e.target.files);
        setFileList(e.target.files);
    }
    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        console.log(e.target.files);
        setJsonList(e.target.files);
    }
    const handleSubmit = async () => {
        if (!fileList) return;
        let tempList = []
        for (let file of Object.values(fileList)) {
            try {
                console.log('upload file: ', file.name)
                const added = await client.add(file)
                const url = `https://ipfs.infura.io/ipfs/${added.path}`
                console.log(url)
                tempList.push(url);
            } catch (error) {
                console.log('Error uploading file: ', error)
            }
            setFileUrl(tempList);
        }
    }
    return (
        <div className="App">
            <InitStep/>
            <h1>IPFS Example</h1>
            <input type="file" id="folder" ref={imageUploader} onChange={handleImageUpload} />
            <input type="file" id="folder" ref={jsonUploader} onChange={handleJsonUpload} />
            <button onClick={handleSubmit}>Sumbit</button>
                <ul>
                {
                fileUrl.map((url,index)=>(
                    <li>
                        <img key={index} src={url} width="600px" />
                    </li>
                    ))
                }
                </ul>

        </div>
    );
}

export default SettingPage

