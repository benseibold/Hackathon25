import { Injectable, inject } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore = inject(Firestore);

  private itemsCollection = collection(this.firestore, 'items');

  saveUser()
}
