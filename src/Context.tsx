import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState, useMemo, useCallback } from "react";

interface Teacher {
  firstname: string;
  lastname: string;
}

interface ContextType {
  teacherId: string;
  setTeacherId: (id: string) => void;
  teacherName: string;
  setTeacherName: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
}

interface ContextProviderProps {
  children: ReactNode;
}

const teacherApi = axios.create({
  baseURL: "https://comlab-backend.vercel.app/api",
  timeout: 5000
});

const TeacherContext = createContext<ContextType | undefined>(undefined);

export const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => {
  // Safely get initial teacherId from localStorage
  const [teacherId, setTeacherIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    
    try {
      const storage = localStorage.getItem("teacherID");
      // If storage exists, parse it, otherwise return empty string
      return storage ? JSON.parse(storage) : "";
    } catch (error) {
      console.error("Error parsing teacherID from localStorage:", error);
      return "";
    }
  });

  const [teacherName, setTeacherName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setTeacherId = useCallback((id: string) => {
    setTeacherIdState(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("teacherID", JSON.stringify(id));
      } catch (error) {
        console.error("Error saving teacherID to localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    const getInfo = async () => {
      if (!teacherId) return;
      
      setIsLoading(true);
      try {
        const response = await teacherApi.get<{teacher: Teacher}>(
          `/teacher/getSpecificTeacher/${teacherId}`,
          { signal: controller.signal }
        );
        
        if (response?.status === 200) {
          const { firstname, lastname } = response.data.teacher;
          setTeacherName(`${firstname} ${lastname}`);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Failed to fetch teacher info:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    getInfo();
    
    return () => {
      controller.abort();
    };
  }, [teacherId]);

  const contextValue = useMemo(() => ({
    teacherId,
    setTeacherId,
    teacherName,
    setTeacherName,
    isLoading
  }), [teacherId, setTeacherId, teacherName, isLoading]);

  return (
    <TeacherContext.Provider value={contextValue}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = (): ContextType => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error("useTeacher must be used within a ContextProvider");
  }
  return context;
};