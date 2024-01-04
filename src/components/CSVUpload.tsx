import React from "react";
import CSVReader from "react-csv-reader";
import { VariantData } from "../utils/types";
import {Typography} from "@mui/material";

type Props = {
  onUpload: (data: VariantData[]) => void;
  setCSVData: (data: VariantData[]) => void;
  setCSVFileName: (csvFileName: string) => void;
};

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

const header = "nextprotPosition,originalAminoAcid,variantAminoAcid\r\n";

const papaparseOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  transformHeader: (header: string) => {
    return header.replace(/\W/g, "-");
  },
  beforeFirstChunk(chunk: string): string | void {
    if (!chunk.startsWith("nextprotPosition")) {
      // Check if there is another header
      if (!chunk.split(",")[0].match("^[0-9]+ ")) {
        // Need to remove the header first
        chunk = chunk.substring(chunk.indexOf("\n") + 1, chunk.length);
      }
      chunk = header.concat(chunk);
      return chunk;
    }
  },
};

const CSVUpload = ({
  onUpload,
  setCSVData,
  setCSVFileName,
}: Props) => {
  const handleForce = (data: VariantData[], fileInfo: FileInfo) => {
    setCSVData(data);
    let fileName = fileInfo.name;
    setCSVFileName(fileName);
    onUpload(data);
  };

  return (
    <div className="csv-button-container">
      <div className="csv-button">
        <Typography variant={"subtitle1"}>Upload variants</Typography>
        <Typography variant={"body2"}>Each line of the file should contain a variant inthe form of .p.[ORG][position][VAR]</Typography>
        <Typography variant={"body2"}>E.g .p.D21H</Typography>
      </div>
      <CSVReader
        cssClass="csv-reader-input"
        onFileLoaded={handleForce}
        parserOptions={papaparseOptions}
        cssInputClass="csv-input"
      />
    </div>
  );
};

export default CSVUpload;
