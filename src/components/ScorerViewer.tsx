import React, { useEffect, useState } from "react";
import FeatureViewerComponent from "./FeatureViewer";
import CSVUpload from "./CSVUpload";
import FileUploader from "./FileUploader";
import {FileRejection} from "react-dropzone";
import {getVariantScores} from "../utils/service";
import Loader from "./Loader";
import {Typography} from "@mui/material";

function ScorerViewer(props: any) {

    const [entry, setEntry]  = useState<string>("");
    const [variants, setVariants]  = useState<Array<string>>([]);
    const [variantScores, setVariantScores]  = useState<any | null>(null);
    const [loadingScores, setLoadingScores] = useState(false);
    const [errorInput, setErrorInput] = useState(false);
    const [featureViewerLoaded, setFeatureViewerLoaded] = useState(false);
    const supportedEntries = [
        'NX_P00533',
        'NX_P35240',
        'NX_Q92560'
    ]

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const entry: string | null = params.get("nxentry");
        if(entry) {
            setEntry(entry);
        }
    }, []);

    useEffect(() => {
        if(variants.length < 1) {
            return;
        }

        const variantData = variants.map((variant: string) => {
            const match = variant.match(/\.p\.([A-Za-z])(\d+)([A-Za-z])/);

            if (match) {
                const [, originalAminoAcid, number, variantAminoAcid] = match;
                return {
                    nextprotPosition: parseInt(number, 10),
                    originalAminoAcid,
                    variantAminoAcid
                };
            } else {
                return {
                    nextprotPosition: -1,
                    originalAminoAcid: '-',
                    variantAminoAcid: '-'
                }
            }
        });

        const requestData = {
            entry: entry,
            isoform: `${entry}-1`,
            variantData: variantData
        };
        setLoadingScores(true);
        getVariantScores(requestData)
            .then((variantScoreResponse: any) => {
                setVariantScores(variantScoreResponse);
                setLoadingScores(false);
            });
    }, [variants]);

    const handleFileUpload = (files: File[], rejectedFiles: FileRejection[]) => {
        // Handle the uploaded files here
        console.log('Accepted Files:', files);
        console.log('Rejected Files:', rejectedFiles);
    };

    const isSupportedEntry = () => {
        if(entry) {
            return supportedEntries.includes(entry)
        } else {
            return false;
        }
    }

    const handleFileContentRead = (lines: any[]) => {
        if(lines && lines.length === 0) {
            setErrorInput(true);
        } else {
            setVariants(lines);
        }
    }

    return(
        <>
            {
                entry && isSupportedEntry() && featureViewerLoaded && !loadingScores &&
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <FileUploader
                        onFileUpload={handleFileUpload}
                        onFileContentRead={handleFileContentRead}
                    />
                </div>
            }
            {
                entry && isSupportedEntry() && loadingScores && !errorInput &&
                <div style={{
                    width: '10%',
                }}>
                    <Loader id="feature-loader" />
                    <Typography variant={"body2"}>
                        Calculating variant scores ..
                    </Typography>
                </div>
            }
            {
                entry && isSupportedEntry() && !loadingScores && !errorInput &&
                    <FeatureViewerComponent
                        entry={entry}
                        variantScores={variantScores}
                        loaded={setFeatureViewerLoaded}
                    />
            }
            {!entry &&
                <>
                    <h4>Please provide a neXtProt Entry</h4>
                    <h4>Currently only supports {supportedEntries.map((entry: string) => (<span style={{paddingRight: '5px'}}><a target='_blank' href={`https://www.nextprot.org/entry/${entry}/gh/nextprot-tools/variant-scorer`}>{entry}</a></span>))}</h4>
                </>
            }
            {entry && !isSupportedEntry() && <h4>Currently only supports {supportedEntries.map((entry: string) => (<span><a href={`https://www.nextprot.org/entry/${entry}/gh/nextprot-tools/variant-scorer`}>{entry}</a></span>))}</h4>}
            {entry && errorInput && <h4>Uploaded might not be in the expected format!</h4>}
        </>
    )
}

export default ScorerViewer;