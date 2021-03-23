import { useState, useEffect, useCallback } from "react";
import { Auth } from "aws-amplify";

const CurrentUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  const currentUserInfo = useCallback(async () => {
    return await Auth.currentUserInfo();
  }, []);

  useEffect(() => {
    currentUserInfo()
      .then((userInfo) => {
        if (Object.keys(userInfo).length)
          setUserInfo((prev) => ({ ...prev, ...userInfo }));
      })
      .catch((err) => setUserInfo((prev) => null));
  }, [currentUserInfo]);

  return { userInfo };
};

export const useCurrentUserInfo = CurrentUserInfo;
