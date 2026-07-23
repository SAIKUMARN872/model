import { create } from "zustand";


interface ModelState {


  selectedModel: string;


  availableModels: string[];


  setModel: (

    model: string

  ) => void;



}



export const useModelStore = create<ModelState>((set) => ({


  selectedModel: "GPT",



  availableModels: [

    "GPT",

    "Claude",

    "Llama"

  ],



  setModel: (model) =>


    set({

      selectedModel: model

    })



}));