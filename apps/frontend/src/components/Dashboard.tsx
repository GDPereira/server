import { useState } from "react";
import type { Service, CreateServiceInput } from "../types/service";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "../api/services";
import { ServiceTable } from "./ServiceTable";
import { ServiceForm } from "./ServiceForm";

export function Dashboard() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: services = [], isLoading, error } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const handleCreate = (data: CreateServiceInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleUpdate = (data: CreateServiceInput) => {
    if (!editingService) return;
    updateMutation.mutate(
      { id: editingService.id, ...data },
      {
        onSuccess: () => {
          setEditingService(null);
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    const isConfirmed = confirm(
      "Are you sure you want to delete this service?",
    );

    if (!isConfirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingService(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Services Dashboard
          </h1>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Service
            </button>
          )}
        </div>
        {(error ||
          createMutation.error ||
          updateMutation.error ||
          deleteMutation.error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {(error as Error)?.message ||
              (createMutation.error as Error)?.message ||
              (updateMutation.error as Error)?.message ||
              (deleteMutation.error as Error)?.message ||
              "An error occurred"}
          </div>
        )}
        {showForm && (
          <ServiceForm
            service={editingService}
            onSubmit={editingService ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading services...</p>
          </div>
        )}

        {!isLoading && (
          <ServiceTable
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
