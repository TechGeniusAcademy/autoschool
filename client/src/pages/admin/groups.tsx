import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { API_BASE_URL } from "@/constants/api";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  instructor_id: number;
  instructor_name: string;
  instructor_first_name: string;
  instructor_last_name: string;
  student_count: number;
}

interface GroupWithStudents extends Group {
  students: Student[];
}

const GroupsManagement = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithStudents | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    instructor_id: "",
  });

  useEffect(() => {
    checkAuth();
    loadGroups();
    loadStudents();
    loadInstructors();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success || data.data.user.role !== "admin") {
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    }
  };

  const loadGroups = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setGroups(data.data);
      } else {
        console.error("Invalid groups data received:", data);
        setGroups([]);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        console.error("Invalid students data received:", data);
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    }
  };

  const loadInstructors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor/list`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setInstructors(data.data);
      } else {
        console.error("Invalid instructors data received:", data);
        setInstructors([]);
      }
    } catch (error) {
      console.error("Failed to load instructors:", error);
      setInstructors([]);
    }
  };

  const loadGroupDetails = async (groupId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedGroup({
          ...data.data,
          students: data.data.students || [],
        });
      }
    } catch (error) {
      console.error("Failed to load group details:", error);
    }
  };

  const createGroup = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newGroup,
          instructor_id: parseInt(newGroup.instructor_id),
        }),
      });

      if (response.ok) {
        setNewGroup({ name: "", description: "", instructor_id: "" });
        setShowCreateForm(false);
        loadGroups();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    }
  };

  const updateGroup = async () => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedGroup.name,
          description: selectedGroup.description,
          instructor_id: selectedGroup.instructor_id,
        }),
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedGroup(null);
        loadGroups();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update group");
      }
    } catch (error) {
      console.error("Failed to update group:", error);
      alert("Failed to update group");
    }
  };

  const deleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadGroups();
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null);
        }
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete group");
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Failed to delete group");
    }
  };

  const addStudentToGroup = async (studentId: number) => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups/${selectedGroup.id}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (response.ok) {
        loadGroupDetails(selectedGroup.id);
        loadGroups();
        const result = await response.json();
        alert(result.message || "Студент успешно добавлен в группу");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add student to group");
      }
    } catch (error) {
      console.error("Failed to add student to group:", error);
      alert("Failed to add student to group");
    }
  };

  const removeStudentFromGroup = async (studentId: number) => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/groups/${selectedGroup.id}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadGroupDetails(selectedGroup.id);
        loadGroups();
        const result = await response.json();
        alert(result.message || "Студент успешно удален из группы");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to remove student from group");
      }
    } catch (error) {
      console.error("Failed to remove student from group:", error);
      alert("Failed to remove student from group");
    }
  };

  const availableStudents = Array.isArray(students) ? students.filter((student) => !selectedGroup?.students?.some((groupStudent) => groupStudent.id === student.id)) : [];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление группами</h1>
          <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Создать новую группу
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Groups List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Groups</h2>
            <div className="space-y-4">
              {Array.isArray(groups) &&
                groups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-gray-600 text-sm">{group.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Инструктор:</span> {group.instructor_name}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Студенты:</span> {group.student_count}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => loadGroupDetails(group.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          Просмотр
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGroup({
                              ...group,
                              students: [],
                            } as GroupWithStudents);
                            setShowEditForm(true);
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        >
                          Изменить
                        </button>
                        <button onClick={() => deleteGroup(group.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Group Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {selectedGroup ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Детали группы: {selectedGroup.name}</h2>

                {/* Current Students */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Текущие студенты ({selectedGroup.students?.length || 0})</h3>
                  <div className="space-y-2">
                    {Array.isArray(selectedGroup.students) &&
                      selectedGroup.students.map((student) => (
                        <div key={student.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>
                            {student.first_name} {student.last_name}
                          </span>
                          <button onClick={() => removeStudentFromGroup(student.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                            Удалить
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Add Students */}
                <div>
                  <h3 className="font-medium mb-2">Add Students</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Array.isArray(availableStudents) &&
                      availableStudents.map((student) => (
                        <div key={student.id} className="flex justify-between items-center bg-blue-50 p-2 rounded">
                          <span>
                            {student.first_name} {student.last_name}
                          </span>
                          <button onClick={() => addStudentToGroup(student.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">Select a group to view details</div>
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Создать новую группу</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название группы</label>
                  <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Введите название группы" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Введите описание" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Инструктор</label>
                  <select
                    value={newGroup.instructor_id}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        instructor_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Выберите инструктора</option>
                    {Array.isArray(instructors) &&
                      instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name || `${instructor.first_name} ${instructor.last_name}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Отмена
                </button>
                <button onClick={createGroup} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditForm && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Group</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Group Name</label>
                  <input
                    type="text"
                    value={selectedGroup.name}
                    onChange={(e) =>
                      setSelectedGroup({
                        ...selectedGroup,
                        name: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={selectedGroup.description}
                    onChange={(e) =>
                      setSelectedGroup({
                        ...selectedGroup,
                        description: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instructor</label>
                  <select
                    value={selectedGroup.instructor_id}
                    onChange={(e) =>
                      setSelectedGroup({
                        ...selectedGroup,
                        instructor_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {Array.isArray(instructors) &&
                      instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name || `${instructor.first_name} ${instructor.last_name}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowEditForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={updateGroup} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GroupsManagement;
