"use client";

import { Modal } from "./Modal";
import { FilmIcon, LayersIcon } from "./icons";

export function AddFilmChoiceModal({
  onClose,
  onChooseSingle,
  onChooseChain,
}: {
  onClose: () => void;
  onChooseSingle: () => void;
  onChooseChain: () => void;
}) {
  return (
    <Modal title="Ajouter" onClose={onClose} width={440}>
      <div className="flex flex-col gap-3 p-6">
        <button
          type="button"
          onClick={onChooseSingle}
          className="flex items-center gap-3.5 rounded-[10px] border border-border-strong bg-bg-elev-2 p-4 text-left hover:border-blue-soft-strong hover:bg-blue-soft"
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-soft text-blue">
            <FilmIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[14.5px] font-bold">Un film</span>
            <span className="block text-xs text-text-faint">Ajouter un seul film</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onChooseChain}
          className="flex items-center gap-3.5 rounded-[10px] border border-border-strong bg-bg-elev-2 p-4 text-left hover:border-blue-soft-strong hover:bg-blue-soft"
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-soft text-blue">
            <LayersIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[14.5px] font-bold">Chaîne de films</span>
            <span className="block text-xs text-text-faint">
              Plusieurs films à la fois — saga ou films sans rapport
            </span>
          </span>
        </button>
      </div>
    </Modal>
  );
}
