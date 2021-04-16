import { useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { Storage, Auth, API } from "aws-amplify";

import { Spinner } from "../../shared";
import * as config from "../../config.json";

const getPictures = async () => {
  return await Storage.list("pictures/", { level: "private" });
};

const getCurrentUserInfo = async () => {
  return await Auth.currentUserInfo();
};

const getPreSignedUrl = async (key) => {
  return await Storage.get(key, { level: "private" });
};

const getLabels = async (key) => {
  const params = {
    body: {
      key,
    },
    headers: {
      "Content-Type": "application/json",
    },
    response: false,
  };
  const apiResponse = await API.post(config.api.name, config.api.path, params);
  const result = apiResponse.data.map((item) =>
    item.labels.map((label) => label)
  );
  return (result || []).join(", ");
};

const PictureGallery = () => {
  const [pictureList, setPictureList] = useState({
    isPending: false,
    value: [],
  });

  useEffect(() => {
    (async () => {
      const userInfo = await getCurrentUserInfo(),
        pictures = await getPictures(),
        promises = pictures.map(async (picture) => {
          const key = picture.key.replace("pictures/", ""),
            signedKey = picture.key,
            labelKey = `private/${userInfo.id}/pictures/${key}`;
          return {
            original: await getPreSignedUrl(signedKey),
            description: await getLabels(labelKey),
          };
        });
      setPictureList((prev) => ({ ...prev, isPending: true }));
      Promise.all(promises).then((results) =>
        setPictureList((prev) => ({
          ...prev,
          isPending: false,
          value: [...results],
        }))
      );
    })();
    return () => {
      //API.cancel(getPictures());
    }
  }, []);
  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">Your Picture Gallery</h1>
          <br />
          <div className="columns is-centered">
            <div className="column has-text-centered">
              {pictureList.isPending ? (
                <Spinner />
              ) : (
                <ImageGallery
                  items={pictureList.value}
                  showThumbnails={false}
                  showPlayButton={false}
                  showFullscreenButton={false}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const PictureGalleryPage = PictureGallery;
