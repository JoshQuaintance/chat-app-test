// import {firestore} from "../firestore";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function post(req) {
    const body = req.body;

    const docs = await getDocs(collection(db, 'messages'));

    // .add({
    //     name: body.name,
    //     message: body.message
    // })
}
