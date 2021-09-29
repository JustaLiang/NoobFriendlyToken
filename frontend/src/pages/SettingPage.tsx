import React from 'react'
import { useState, useCallback,useRef } from 'react'
import { create } from 'ipfs-http-client'
import InitStep from '../components/InitStep'
import LinearProgressWithLabel from '../components/LinearProgressWithLabel';
import { Paper } from '@material-ui/core';
const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

interface Props {

}

function SettingPage(props: Props) {
    const [fileList, setFileList] = useState<FileList>();
    const [testList, setTestList] = useState<File[]>();
    const [jsonList, setJsonList] = useState<FileList>();
    const [fileUrl, setFileUrl] = useState<string[]>([]);
    const [file, setFile] = useState<File>();
    const [count,setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const addCount = useCallback(() => {
        console.log(count);
        setCount(count=>count+1);
       }, [setCount]);
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
        console.log(Object.values(e.target.files));
        setTestList(Object.values(e.target.files));
        setTotalCount(e.target.files.length);
    }
    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        console.log(e.target.files);
        setJsonList(e.target.files);
    }
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        console.log(e.target.files);
        setFile(e.target.files[0]);
    }
    const handleFileSubmit = async () => {
        if (!testList) return;
        const addOptions = {
            pin: true,
            rawLeaves:true,
            progress: (prog:number) => {
                console.log(prog);
                addCount();
            }
        }
        
        let count = 0;

        for await (const result of client.addAll(testList, addOptions)) {
            // count += 1;
            // if (count == testList.length+1){
            //     console.log(result.cid['_baseCache'].get("z"));
            // }
            console.log(result);
            
        }
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
    console.log(count);
    const progress = Math.min(count / totalCount * 100,100);
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <InitStep />
            <Paper>
                <h1>IPFS Example</h1>
                <input type="file" id="folder" ref={imageUploader} onChange={handleImageUpload} />
                <input type="file" id="folder" ref={jsonUploader} onChange={handleJsonUpload} />
                <input type="file" id='file' onChange={handleFileUpload} />
                {fileList ?
                    <LinearProgressWithLabel value={progress} /> : <></>
                }
                <button onClick={handleFileSubmit}>File Submit</button>
                <button onClick={handleSubmit}>Sumbit</button>
            </Paper>

        </div>
    );
}

export default SettingPage

