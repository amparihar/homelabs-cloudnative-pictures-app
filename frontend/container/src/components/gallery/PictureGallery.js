import { useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { Storage, Auth } from "aws-amplify";

const getPictures = async () => {
  return await Storage.list("pictures/", { level: "private" });
};

const getCurrentUserInfo = async () => {
  return await Auth.currentUserInfo();
};

const getPreSignedUrl = async (key) => {
  return await Storage.get(key, { level: "private" });
};

const PictureGallery = () => {
  const [pictureList, setPictureList] = useState([]);

  useEffect(() => {
    (async () => {
      const userInfo = await getCurrentUserInfo();
      const pictures = await getPictures();
      const promises = pictures.map(async (picture) => {
        const key = picture.key;
        const s3Key = `private/${userInfo.id}/pictures/${key}`;
        return {
          original: await getPreSignedUrl(key),
        };
      });
      Promise.all(promises).then((results) =>
        setPictureList((prev) => [...prev, ...results])
      );
    })();
  }, []);
  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">Your Picture Gallery</h1>
          
          <br />
          <div className="columns">
            <div className="column">
              {pictureList.length ? (
                <ImageGallery
                  items={pictureList}
                  showThumbnails={false}
                  showPlayButton={false}
                  showFullscreenButton={false}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const PictureGalleryPage = PictureGallery;
