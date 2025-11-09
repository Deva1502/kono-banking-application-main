"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { RiExpandUpDownLine as ChevronUpDownIcon } from "react-icons/ri";
import { FaCheck as CheckIcon } from "react-icons/fa6";
import { useMainContext } from "@/context/MainContext";

export default function SelectCard() {
  const { user, fetchATMDetails } = useMainContext();
  const [selected, setSelected] = useState("");

  const cards = useMemo(() => (Array.isArray(user?.atms) ? user.atms : []), [user?.atms]);

  // When cards load and nothing selected, pick the first
  useEffect(() => {
    if (!selected && cards.length > 0) {
      setSelected(cards[0]._id);
    }
  }, [cards, selected]);

  // Fetch details when selection changes
  useEffect(() => {
    if (selected) fetchATMDetails(selected);
  }, [selected, fetchATMDetails]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none">
          <span className="block truncate">
            {selected
              ? `${selected}`
              : cards.length > 0
              ? "Choose a card"
              : "No cards available"}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {cards.map((a) => (
              <Listbox.Option
                key={a._id}
                value={a._id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-rose-100 text-rose-900" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                      {`${a._id} - ${a.card_type}`}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
