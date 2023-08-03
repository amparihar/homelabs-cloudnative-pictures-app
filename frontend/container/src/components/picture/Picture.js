import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import { Auth, Storage, API } from "aws-amplify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as config from "../../config.json";
import { PictureList } from "./";

const getImageDetails = (image) => {
  let filenameOnly = image.key.replace("pictures/", "");
  let modified = image.lastModified.toString();

  return {
    key: filenameOnly,
    lastModified: modified,
  };
};

const Picture = () => {
  const [selectedPic, setSelectedPic] = useState({
    uploading: false,
    file: null,
  });
  const [picList, setPicList] = useState({ isLoading: false, data: [] });

  // Cognito IdentityPoolId
  const cognitoId = useRef(null);

  const currentUserInfo = useCallback(async () => {
    return await Auth.currentUserInfo();
  }, []);

  const listPictures = useCallback(async () => {
    try {
      setPicList((list) => ({ isLoading: true, data: [] }));
      const images = await Storage.list("pictures/", { level: "private" });
      setPicList((list) => ({
        isLoading: false,
        data: images.map(getImageDetails),
      }));
    } catch (err) {
      setPicList((list) => ({ isLoading: false, data: [] }));
      toast.error(err.message || err);
    }
  }, [setPicList]);

  useEffect(() => {
    currentUserInfo().then(
      (userInfo) => (cognitoId.current = userInfo ? userInfo.id : null)
    );
  }, [currentUserInfo]);

  useEffect(() => {
    listPictures();
    return () => {
      //API.cancel(listPictures(), "AbortError");
    }
  }, [listPictures]);

  const handleOnChange = (e) => {
    setSelectedPic((pic) => ({ ...pic, file: e.target.files[0] }));
  };

  const handleUpload = async () => {
    try {
      if (!selectedPic.file) return;
      setSelectedPic((pic) => ({ ...pic, uploading: true }));

      const key = `pictures/${selectedPic.file.name}`,
        file = selectedPic.file,
        config = { contentType: selectedPic.file.type, level: "private" };

      await Storage.put(key, file, config);

      setSelectedPic((pic) => ({ ...pic, uploading: false, file: null }));

      listPictures();

      toast.success("Picture uploaded successfully");
    } catch (err) {
      setSelectedPic((pic) => ({ ...pic, uploading: false, file: null }));
      toast.error(err.message || err);
    }
  };

  const onPictureDeletes = async (data) => {
    const cfm = window.confirm(
      `Are you sure to delete ${data.length} picture(s)?`
    );
    if (!cfm) return;
    const keys = data.map((item) => item.key);
    const promises = keys.map(async (key) => {
      const params = {
        headers: {
          "Content-Type": "application/json",
        },
        response: true,
        queryStringParameters: {
          key: `private/${cognitoId.current}/pictures/${key}`,
        },
      };
      return await API.del(config.api.name, config.api.path, params);
    });
    try {
      setPicList((list) => ({ ...list, isLoading: true }));
      await Promise.all(promises);
      setPicList((list) => ({
        ...list,
        isLoading: false,
        data: list.data.filter((item) => keys.indexOf(item.key) === -1),
      }));
    } catch (err) {
      setPicList((list) => ({ ...list, isLoading: false }));
      toast.error(err.response || err);
    }
  };

  const handlePictureDeletes = useCallback(onPictureDeletes, [
    setPicList
  ]);

  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">Upload a new Picture</h1>
          <div className="columns">
            <div className="column is-narrow">
              <div className="file is-info is-right has-name">
                <label className="file-label">
                  <input
                    className="file-input"
                    type="file"
                    name="image"
                    accept="image/png, image/jpeg"
                    onChange={handleOnChange}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <FontAwesomeIcon icon="upload" />
                    </span>
                    <span className="file-label">Browse Picture</span>
                  </span>
                  <span className="file-name">
                    {selectedPic.file
                      ? selectedPic.file.name
                      : "No Picture selected"}
                  </span>
                </label>
              </div>
            </div>
            <div className="column">
              <button
                className={
                  selectedPic.uploading
                    ? "button is-primary is-loading"
                    : "button is-primary"
                }
                onClick={handleUpload}
                disabled={!selectedPic.file || selectedPic.uploading}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
        <div className="container" style={{ marginTop: "10px" }}>
          <PictureList
            pictureList={picList}
            deletePictures={handlePictureDeletes}
          />
        </div>
      </section>
    </>
  );
};

export default Picture;
