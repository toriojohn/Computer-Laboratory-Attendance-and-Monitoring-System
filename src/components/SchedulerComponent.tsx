import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

interface Event {
  event_id: string;
  title: string;
  start: Date;
  end: Date;
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
  comlab: string;
}

interface ApiResponse {
  event_id: string;
  title: string;
  start: string;  // The API returns a string date
  end: string;    // The API returns a string date
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
  comlab: string;
}

interface Teacher {
  id: number;
  text: string;
  value: string;
}

interface ComLab {
  id: number;
  text: string;
  value: string,
}

interface Courses {
  id: number;
  text: string;
  value: string,
}

interface Subjects {
  id: number;
  text: string;
  value: string,
}

export const SchedulerComponent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Teacher[]>([]);
  const [comlabOptions, setComlabOptions] = useState<ComLab[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<Courses[]>([]);
  const [subjectsOptions, setSubjectsOptions] = useState<Subjects[]>([]);
  const [sectionsOptions, setSectionsOptions] = useState<Subjects[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");

      const names = response.data.map((teacher: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${teacher.firstname} ${teacher.lastname}`,
        value: `${teacher.firstname} ${teacher.lastname}`,
      }));

      setTeacherOptions(names);
      return names; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  };

  const fetchComlabs = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computer/getList");
      // console.log(response.data.com)
      const comlabs = response.data.com.map((comlab: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${comlab.name}`,
        value: `${comlab.name}`,
      }));

      setComlabOptions(comlabs);
      return comlabs; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching comlabs:", error);
      return [];
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getSections");
      const sections = response.data.map((section: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${section.section}`,
        value: `${section.section}`,
      }));

      setSectionsOptions(sections);
      return sections;
    } catch (error) {
      console.error("Error fetching sections:", error);
      return [];
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getCourses");
      // console.log(response.data.com)
      const courses = response.data.map((course: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${course.course}`,
        value: `${course.course}`,
      }));

      setCoursesOptions(courses);
      return courses; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getSubjects");
      // console.log(response.data.com)
      const subjects = response.data.map((subject: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${subject.subject}`,
        value: `${subject.subject}`,
      }));

      setSubjectsOptions(subjects);
      return subjects; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get<ApiResponse[]>("https://comlab-backend.vercel.app/api/schedule/getSched");

      const parsedEvents: Event[] = response.data.map(event => ({
        event_id: event.event_id,
        title: event.title,
        start: new Date(event.start), // Convert start date string to Date
        end: new Date(event.end),     // Convert end date string to Date
        teacher_name: event.teacher_name,
        subject: event.subject,
        course: event.course,
        section: event.section,
        subtitle: event.subtitle,
        comlab: event.comlab,
      }));

      setEvents(parsedEvents);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchTeachers();
      await fetchSchedules();
      await fetchComlabs();
      await fetchCourses();
      await fetchSubjects();
      await fetchSections()
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleConfirm = async (event: Event, action: "create" | "edit") => {
    if (action === "create") {
      const newEvent = {
        event_id: Date.now().toString(), // Generate a unique ID using Date.now()
        title: event.title,
        start: event.start.toISOString(), // Convert to ISO string
        end: event.end.toISOString(),     // Convert to ISO string
        teacher_name: event.teacher_name,
        subject: event.subject,
        course: event.course,
        section: event.section,
        subtitle: event.subtitle,
        comlab: event.comlab
      };

      try {
        const response = await axios.post("https://comlab-backend.vercel.app/api/schedule/addSchedule", newEvent);
          if (response.data && response.status === 200) {
            console.log("Event added successfully:", response.data);
            // Refresh the events after adding
            fetchSchedules();
          }
      } catch (error: any) {
        console.error("Error adding new event:", error);
        toast.error("Conflict on schedule detected!");
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 400) {
            return Promise.reject(error.response.data); 
          
          }
        } else {
          console.error("Unexpected error:", error);
        }
      }
    } else if (action === "edit") {
      try {
        const updatedEvent = {
          event_id: event.event_id,
          title: event.title,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          teacher_name: event.teacher_name,
          subject: event.subject,
          course: event.course,
          section: event.section,
          subtitle: event.subtitle,
          comlab: event.comlab,
        };

        await axios.put(`https://comlab-backend.vercel.app/api/schedule/updateSched`, updatedEvent);

        fetchSchedules();
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
    return event;
  };

  const handleDelete = async (event_id: string) => {
    try {
      // Send a DELETE request to remove the event
      await axios.delete(`https://comlab-backend.vercel.app/api/schedule/deleteSched/${event_id}`);
      console.log("Deleted event id:", event_id);
      // Refresh the events after deletion
      setEvents(events.filter(event => event.event_id !== event_id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
    return Promise.resolve(event_id);
  };

  if (isLoading) {
    return <Skeleton className="flex justify-center items-center h-full"></Skeleton>;
  }

  return (
    <div className="flex justify-center w-full z-0">
      <div className="w-full">
        <Scheduler
          height={600}
          draggable={false}
          events={events}
          week={{
            weekDays: [0, 1, 2, 3, 4, 5],
            weekStartOn: 6,
            startHour: 6,
            endHour: 22,
            step: 60,
          }}
          day={{
            startHour: 6,
            endHour: 22,
            step: 60,
          }}
          fields={[
            {
              name: "teacher_name",
              type: "select",
              options: teacherOptions,
              config: { label: "Teacher", required: true, errMsg: "Please select a teacher" },
            },
            {
              name: "subject",
              type: "select",
              options: subjectsOptions,
              config: { label: "Subject", required: true, errMsg: "Please select a subject" },
            },
            {
              name: "course",
              type: "select",
              options: coursesOptions,
              config: { label: "Course", required: true, errMsg: "Please select a course" },
            },
            {
              name: "section",
              type: "select",
              options: sectionsOptions,
              config: { label: "Section", required: true, errMsg: "Please select a section" },
            },
            {
              name: "comlab",
              type: "select",
              options: comlabOptions,
              config: { label: "Com Lab", required: true, errMsg: "Please select a comlab" },
            },
          ]}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};