import React, { useEffect, useState } from "react";
import { Nextprot, createFeature } from "feature-viewer";

import { featureList } from "../utils/featureList";
import {
  getFeaturesByView,
  getFeaturesByIsoform,
  addFeatures,
  getMetadataByView,
} from "../utils/helpers/getFeatures";
import Isoform from "./Isoform";
import {
  FeatsForViewer,
  FeatureData,
  IsoformMapping,
  IsoformType,
  MetaData,
  VariantData,
} from "../utils/types";
import Loader from "./Loader";
import { ERROR } from "../utils/constants";
import { getIsoformList, getPredictions } from "../utils/service";
import log from "../utils/helpers/logger";
import { parseData } from "../utils/helpers/parseData";

const FeatureViewerComponent = (props: any) => {
  const {entry} = props;
  const [isoform, setIsoform] = useState<IsoformMapping[]>();
  const [sequence, setSequence] = useState<IsoformType[]>();
  const [isoName, setIsoName] = useState<string>();
  const [features, setFeatures] = useState<FeatsForViewer[]>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [fv, setFv] = useState<any>();

  const CONTAINER_ID = "fv1";
  const nx = new Nextprot.Client("Calipho Group", "VEP community tool");

  function buildFeatures(
    fv: any,
    sequences: IsoformType[],
    isoName: string,
    features: FeatureData[],
  ) {
    sequences.forEach(function (seq: IsoformType) {
      if (seq.uniqueName === isoName) {
        let featureViewer = new createFeature(seq.sequence, "#fv1", {
          showAxis: true,
          showSequence: true,
          brushActive: true,
          toolbar: true,
          bubbleHelp: false,
          zoomMax: 10,
          variant: true,
        });

        setFv(featureViewer);

        features.map((feat: FeatureData) => {
          featureViewer.addFeature(feat);
        });

        featureViewer.onGetPredictions((d: CustomEvent) => {
          let data = {
            isoform: isoName,
            variants: d.detail,
          };
        });
      }
    });
  }

  function handleIsoformChange(value: string) {
    setIsoName(value);
    document.getElementById(CONTAINER_ID)!.innerHTML = "";
    const featureList: FeatureData[] = addFeatures(features!, value);
    buildFeatures(fv, sequence!, value, featureList);
  }

  useEffect(() => {
    getIsoformList(entry).then((res) => {
      setIsoform(res);
    });

    let sequences: IsoformType[];
    let features: FeatureData[];

    Promise.all(getFeaturesByView(featureList, nx, entry))
      .then((rawData) => {
        if (rawData) {
          sequences = rawData[0];
          const metadata: MetaData[] = getMetadataByView();
          const featsForViewer: FeatsForViewer[] = getFeaturesByIsoform(
            rawData,
            metadata,
          );

          let inputVariant : any = {};
          let scores : any = {};
          if(props.variantScores && props.variantScores.variants.length > 0) {
            inputVariant[sequences[0].isoformAccession] = {
              className: 'uvariant',
              name: 'User Variant',
              color: 'rgba(255,165,0)',
              filter: 'User Variant',
              type: 'unique'
            }
            inputVariant[sequences[0].isoformAccession].data = [];
            props.variantScores.variants.forEach((variant: any, index: number) => {
              inputVariant[sequences[0].isoformAccession].data.push({
                category: "User Variant",
                description: "<span class='variant-description'>"+ variant.originalAminoAcid +"→"+ variant.variantAminoAcid +"</span>",
                id: "user_variant_" + index,
                x: variant.nextprotPosition,
                y: variant.nextprotPosition
              })
            });

            scores[sequences[0].isoformAccession] = {
              className: "score",
              color: "#87abe0",
              name: "Variant Score",
              type: "bar",
              filter: "variant-score",
            }
            scores[sequences[0].isoformAccession].data = [];
            props.variantScores.variants.forEach((variant: any, index: number) => {
              scores[sequences[0].isoformAccession].data.push({
                category: "neXtProt Score",
                description: `<span class='score'>${variant.score}</span>`,
                id: "score_"+index,
                x: variant.nextprotPosition,
                y: variant.score
              });
            });


          }

          featsForViewer.unshift(inputVariant);
          featsForViewer.unshift(scores);

          document.getElementById(CONTAINER_ID)!.innerHTML = "";
          features = addFeatures(featsForViewer, sequences[0].isoformAccession);
          features = features.filter(f => f.className !== 'intregion');
          buildFeatures(fv, sequences, sequences[0].isoformAccession, features);

          setSequence(sequences);
          setFeatures(featsForViewer);
          setIsoName(sequences[0].isoformAccession);
          setLoading(false);
          props.loaded(true);
        } else {
          setError(ERROR.NOT_FOUND);
        }
      })
      .catch((err) => {
        log(err);
      });
  }, [props.variantScores]);

  return (
    <>
      {loading &&
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '10%'
            }}>
                <Loader id="feature-loader" />
            </div>
          </div>
      }
      <div className="viewer-container">
        {isoform && !error && (
          <Isoform
            isoName={isoName}
            isoform={isoform}
            handleIsoformChange={handleIsoformChange}
          />
        )}
        <div id="fv1" />
      </div>
    </>
  );
};

export default FeatureViewerComponent;
