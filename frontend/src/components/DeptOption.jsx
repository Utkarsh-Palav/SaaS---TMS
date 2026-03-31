import Select from "react-select";
import axios from "axios";
import { useEffect, useState } from "react";

export default function DeptOption({ selectedDept, setSelectedDept }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartment = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/department/details`,
        {
          withCredentials: true,
        }
      );

      const formatted = res.data.map((dept) => ({
        value: dept._id,
        label: dept.name,
        manager: dept.manager
      }));
      
      setOptions(formatted);
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  return (
    <label className="block text-left w-full text-black">
      <Select
        isDisabled={loading}
        options={options}
        value={selectedDept}
        onChange={setSelectedDept}
        placeholder="Select department"
        className="mt-1"
      />
    </label>
  );
}
