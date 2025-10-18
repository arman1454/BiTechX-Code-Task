"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

interface Props {
  product: any;
  onView: (slug: string) => void;
  onEdit: (slug: string) => void;
  onDelete: (id: string) => Promise<any> | void;
}

export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="bg-card border-2 border-secondary text-card rounded-lg shadow-md p-0 hover:shadow-lg transition">
      <CardBody className="p-4">
        <Image
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <h2 className="font-semibold text-lg text-card">{product.name}</h2>
        <p className="text-sm mb-2 line-clamp-2 text-secondary">
          {product.description}
        </p>
        <p className="font-medium text-primary mb-3">${product.price}</p>
      </CardBody>

      <CardFooter className="px-4 pb-4">
        <div className="flex justify-between text-sm w-full items-center">
          <Button
            onPress={() => onView(product.slug)}
            className="bg-primary text-background hover:bg-primary-700"
          >
            View
          </Button>
          <Button
            onPress={() => onEdit(product.slug)}
            className="bg-secondary text-background hover:bg-primary-700"
          >
            Edit
          </Button>
          <Button
            onPress={() => {
              setIsModalOpen(true);
            }}
            className="bg-accent text-background hover:bg-accent-700"
          >
            Delete
          </Button>
        </div>
      </CardFooter>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirm delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this product?</p>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-center gap-4 w-full">
              <Button
                type="button"
                onPress={async () => {
                  await onDelete(product.id);
                  setIsModalOpen(false);
                }}
                className="bg-accent text-background px-4 py-2 rounded-md hover:opacity-90"
              >
                Yes, Delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                onPress={() => setIsModalOpen(false)}
                className="border border-secondary text-secondary px-4 py-2 rounded-md hover:bg-secondary hover:text-primary transition"
              >
                Cancel
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
