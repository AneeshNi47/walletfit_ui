import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

export default function CategoriesPage() {
  const { auth, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/categories/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setCategories(response.data.results);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories. Please try again.');
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [auth, logout]);

  useEffect(() => {
    if (auth?.access) {
      fetchCategories();
    }
  }, [auth, fetchCategories]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      await axios.post('/categories/', { name: newCategoryName }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setNewCategoryName('');
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to add category:', err);
      setAddError(err?.response?.data?.name?.[0] || 'Failed to add category. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (category) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await axios.put(`/categories/${editCategory.id}/`, { name: editName }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setShowEditModal(false);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to update category:', err);
      setEditError(err?.response?.data?.name?.[0] || 'Failed to update category. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (category) => {
    setDeleteCategory(category);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await axios.delete(`/categories/${deleteCategory.id}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setShowDeleteModal(false);
      setDeleteCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setDeleteError('Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
        <p>Error: {error}</p>
        <button onClick={fetchCategories} className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded hover:bg-brand-forest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Your Categories</h1>
          <button
            onClick={() => { setNewCategoryName(''); setAddError(''); setShowAddModal(true); }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 w-full sm:w-auto"
          >
            + Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No categories found.</p>
            <p className="text-sm mt-2">Click "Add Category" to create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md p-5 flex justify-between items-center border border-gray-200 hover:shadow-lg transition duration-200"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-800">{category.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(category)}
                    className="px-3 py-1 min-h-[40px] text-sm bg-brand-warm text-brand-forest rounded hover:bg-brand-warm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDelete(category)}
                    className="px-3 py-1 min-h-[40px] text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <Modal title="Add New Category" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {addError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{addError}</p>
            )}
            <div>
              <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                id="new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                placeholder="e.g. Groceries"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-brand-emerald text-white rounded-lg hover:bg-brand-forest transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {addLoading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editCategory && (
        <Modal title="Edit Category" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {editError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{editError}</p>
            )}
            <div>
              <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                id="edit-category-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="Category name"
                className="w-full px-4 py-2 min-h-[40px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-brand-emerald text-white rounded-lg hover:bg-brand-forest transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteCategory && (
        <Modal title="Delete Category" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            {deleteError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{deleteError}</p>
            )}
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">"{deleteCategory.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
