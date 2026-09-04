"use client";

import { useGetUserAccountInfoQuery } from "@/redux/features/account";
import { setUser , finishInitialization} from "@/redux/features/systemAuth";
import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthProvider({ children, }: {
    children: ReactNode;
}): ReactNode {

const { data, isError, isSuccess } = useGetUserAccountInfoQuery(undefined);

const dispatch = useDispatch();

useEffect(() => {
    if (isSuccess && data?.success) {
        dispatch(setUser(data.data));

    }

    if (isError) {
        dispatch(finishInitialization());
    }
}, [isSuccess, isError, data, dispatch]);


    return children;
}