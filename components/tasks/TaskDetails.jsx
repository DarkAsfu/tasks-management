"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/app/providers/AuthProvider"

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const STATUS_OPTIONS = ["PENDING", "PROCESSING", "DONE"]

// Utility Function
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "PENDING":
      return "text-purple-700 border-purple-200"
    case "PROCESSING":
      return "text-orange-700 border-orange-200"
    case "DONE":
      return "text-green-700 border-green-200"
    default:
      return "text-gray-700 border-gray-200"
  }
}

const getStatusDotColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-purple-700"
    case "PROCESSING":
      return "bg-orange-700"
    case "DONE":
      return "bg-green-700"
    default:
      return "bg-gray-700"
  }
}

const formatStatusLabel = (status) => {
  if (status === "PENDING") return "Pending"
  if (status === "PROCESSING") return "Processing"
  if (status === "DONE") return "Done"
  return status
}

export default function TaskDetails({ task_id }) {
  const router = useRouter()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    if (!token) {
      throw new Error("Missing access token. Please login again.")
    }
    return { Authorization: `Bearer ${token}` }
  }, [])

  // Fetch task details
  const fetchTaskDetails = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/${task_id}`, {
        headers: getAuthHeaders(),
      })
      setTask(res.data || null)
      setSelectedStatus(res.data?.status || "")
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to continue")
        setTimeout(() => router.push("/login"), 2000)
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to fetch task details")
      }
    } finally {
      setLoading(false)
    }
  }, [task_id, router, getAuthHeaders])

  // Handle status change
  const handleStatusChange = useCallback(async () => {
    if (!task || selectedStatus === task.status) {
      return
    }

    setUpdating(true)
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/tasks/${task_id}/status`,
        { status: selectedStatus },
        { headers: getAuthHeaders() }
      )
      setTask(res.data || { ...task, status: selectedStatus })

      // Show success modal if task is completed
      if (selectedStatus === "DONE") {
        setShowSuccessModal(true)
      } else {
        toast.success("Task status updated successfully")
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to continue")
        setTimeout(() => router.push("/login"), 2000)
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to update task status")
      }
    } finally {
      setUpdating(false)
    }
  }, [task, selectedStatus, task_id, router, getAuthHeaders])

  // Handle task deletion
  const handleDeleteTask = useCallback(async () => {
    setUpdating(true)
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${task_id}`, {
        headers: getAuthHeaders(),
      })
      toast.success("Task deleted successfully")
      router.push("/")
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to continue")
        setTimeout(() => router.push("/login"), 2000)
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to delete task")
      }
    } finally {
      setUpdating(false)
      setShowDeleteModal(false)
    }
  }, [task_id, router, getAuthHeaders])

  useEffect(() => {
    fetchTaskDetails()
  }, [fetchTaskDetails])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading task details...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Task not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1320px] p-5 md:p-[30px] relative -top-14 z-[50] rounded-[15px] shadow mx-auto bg-white">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-[30px] gap-4">
            <h1 className="text-[24px] font-poppins font-semibold text-heading">Task Details</h1>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <h3 className="font-poppins text-[16px] text-[#C716F3] font-semibold">
                Assigned to: {task?.assignedUser?.name || "N/A"}
              </h3>
              {user?.role === "ADMIN" && (
                <Button
                  style={{ backgroundColor: "rgba(255, 171, 0, 0.10)" }}
                  className="w-full md:w-[167px] cursor-pointer h-[50px] text-[#FFAB00] text-[18px] font-semibold flex items-center justify-center gap-2"
                  onClick={() => router.push(`/edit-task/${task_id}`)}
                  aria-label="Edit Task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M24.5 25.6667H3.5C3.02167 25.6667 2.625 25.2701 2.625 24.7917C2.625 24.3134 3.02167 23.9167 3.5 23.9167H24.5C24.9783 23.9167 25.375 24.3134 25.375 24.7917C25.375 25.2701 24.9783 25.6667 24.5 25.6667Z"
                      fill="#FFAB00"
                    />
                    <path
                      d="M22.1916 4.06002C19.9283 1.79669 17.7116 1.73835 15.39 4.06002L13.9783 5.47169C13.8616 5.58835 13.815 5.77502 13.8616 5.93835C14.7483 9.03002 17.2216 11.5034 20.3133 12.39C20.36 12.4017 20.4066 12.4134 20.4533 12.4134C20.5816 12.4134 20.6983 12.3667 20.7916 12.2734L22.1916 10.8617C23.3466 9.71836 23.9066 8.61002 23.9066 7.49002C23.9183 6.33502 23.3583 5.21502 22.1916 4.06002Z"
                      fill="#FFAB00"
                    />
                    <path
                      d="M18.2137 13.4517C17.8753 13.2883 17.5487 13.125 17.2337 12.9383C16.977 12.7867 16.732 12.6233 16.487 12.4483C16.2887 12.32 16.0553 12.1333 15.8337 11.9467C15.8103 11.935 15.7287 11.865 15.6353 11.7717C15.2503 11.445 14.8187 11.025 14.4337 10.5583C14.3987 10.535 14.3403 10.4533 14.2587 10.3483C14.142 10.2083 13.9437 9.97502 13.7687 9.70668C13.6287 9.53168 13.4653 9.27502 13.3137 9.01835C13.127 8.70335 12.9637 8.38835 12.8003 8.06168C12.7568 7.96835 12.7157 7.87586 12.6767 7.78441C12.5336 7.44913 12.0982 7.35212 11.8405 7.60988L5.06533 14.385C4.91367 14.5367 4.77367 14.8283 4.73867 15.0267L4.10867 19.495C3.992 20.2883 4.21367 21.035 4.70367 21.5367C5.12367 21.945 5.707 22.1667 6.337 22.1667C6.477 22.1667 6.617 22.155 6.757 22.1317L11.237 21.5017C11.447 21.4667 11.7387 21.3267 11.8787 21.175L18.6466 14.407C18.9062 14.1475 18.808 13.7029 18.4695 13.5609C18.3859 13.5258 18.3009 13.4895 18.2137 13.4517Z"
                      fill="#FFAB00"
                    />
                  </svg>
                  Edit Task
                </Button>
              )}
              <Button
                className="w-full cursor-pointer md:w-[167px] h-[50px] bg-primary text-heading text-[16px] font-semibold"
                onClick={() => router.back()}
                aria-label="Back to Tasks"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
          <hr className="border-[0.5px] border-[#E1E1E1] mb-[42px]" />
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-[88px] h-[88px] bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 68 68" fill="none">
                    <path
                      d="M61.5694 46.5695V54.8718C61.5694 58.6909 58.4699 61.7904 54.6508 61.7904H34.8913C32.4282 61.7904 31.2106 58.8292 32.9264 57.0858L49.1713 40.4811C49.6971 39.9553 50.4166 39.6509 51.1361 39.6509H54.6508C58.4699 39.6509 61.5694 42.7504 61.5694 46.5695Z"
                      fill="#1F1F1F"
                    />
                    <path
                      d="M51.5244 32.1512L44.0246 39.6509L37.2167 46.4312C35.4732 48.1746 32.4844 46.957 32.4844 44.4939C32.4844 35.6105 32.4844 20.9984 32.4844 20.9984C32.4844 20.2512 32.7888 19.5593 33.2869 19.0335L35.833 16.4874C38.5451 13.7753 42.9176 13.7753 45.6297 16.4874L51.4967 22.3544C54.2365 25.0665 54.2365 29.4391 51.5244 32.1512Z"
                      fill="#1F1F1F"
                    />
                    <path
                      d="M21.4319 6.44165H13.1295C8.97838 6.44165 6.21094 9.20909 6.21094 13.3603V50.7207C6.21094 51.4679 6.29396 52.2151 6.43233 52.9347C6.51536 53.2944 6.59838 53.6542 6.70908 54.014C6.84745 54.4291 6.98582 54.8442 7.15187 55.2316C7.17954 55.2593 7.17954 55.287 7.17954 55.287C7.20722 55.287 7.20722 55.287 7.17954 55.3147C7.56698 56.0896 8.00977 56.8368 8.53559 57.5286C8.84001 57.8884 9.14443 58.2205 9.44884 58.5526C9.75326 58.8847 10.0854 59.1614 10.4451 59.4382L10.4728 59.4658C11.1647 59.9916 11.9119 60.4344 12.6868 60.8219C12.7144 60.7942 12.7144 60.7942 12.7144 60.8219C13.1295 61.0156 13.5447 61.154 13.9874 61.2923C14.3472 61.403 14.707 61.4861 15.0668 61.5691C15.7863 61.7075 16.5335 61.7905 17.2807 61.7905C18.4154 61.7905 19.5777 61.6244 20.657 61.2647C20.9614 61.154 21.2658 61.0433 21.5702 60.9049C22.5388 60.5175 23.4798 59.964 24.31 59.2444C24.5591 59.0507 24.8358 58.8016 25.0849 58.5526L25.1956 58.4419C27.1328 56.4493 28.3505 53.7096 28.3505 50.7207V13.3603C28.3505 9.20909 25.583 6.44165 21.4319 6.44165ZM17.2807 54.8719C14.9837 54.8719 13.1295 53.0177 13.1295 50.7207C13.1295 48.4237 14.9837 46.5696 17.2807 46.5696C19.5777 46.5696 21.4319 48.4237 21.4319 50.7207C21.4319 53.0177 19.5777 54.8719 17.2807 54.8719Z"
                      fill="#1F1F1F"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-poppins leading-tight font-semibold text-[#161616] mb-2">
                    {task.title}
                  </h2>
                  <p className="text-[#667085] font-poppins text-base leading-7">{task.description}</p>
                  <div className="flex gap-8 mt-[61.3px] mb-[61.66px]">
                    <div className="border-r border-[#E1E1E1] pr-10">
                      <h3 className="text-[18px] font-poppins font-semibold text-heading leading-[23.76px] mb-[18px]">
                        Created Date
                      </h3>
                      <div className="flex items-center gap-3 text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                          <path
                            d="M11.7812 2.94507V7.36265"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M23.5625 2.94507V7.36265"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.15625 13.3853H30.1892"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M28.2915 23.2218L23.0788 28.4346C22.8726 28.6407 22.6812 29.0236 22.637 29.3034L22.3572 31.2913C22.2541 32.0128 22.7548 32.5135 23.4763 32.4104L25.4643 32.1306C25.744 32.0865 26.1416 31.895 26.333 31.6889L31.5458 26.4761C32.444 25.5779 32.8711 24.5324 31.5458 23.2071C30.2352 21.8966 29.1897 22.3236 28.2915 23.2218Z"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M27.5391 23.9728C27.9808 25.5631 29.2177 26.8 30.8081 27.2418"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17.6668 32.3956H11.7767C6.62285 32.3956 4.41406 29.4505 4.41406 25.0329V12.5164C4.41406 8.09886 6.62285 5.15381 11.7767 5.15381H23.5569C28.7108 5.15381 30.9196 8.09886 30.9196 12.5164V17.6703"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17.6657 20.1735H17.6789"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.2126 20.1735H12.2258"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.2126 24.5911H12.2258"
                            stroke="#1F1F1F"
                            strokeWidth="2.20879"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="font-poppins text-lg text-heading leading-relaxed">
                          {new Date(task.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeColor(task.status)} text-lg md:text-xl font-semibold border bg-transparent p-4`}
                    >
                      <span
                        className={`${getStatusDotColor(task.status)} h-2.5 w-2.5 rounded-full mr-3`}
                      ></span>
                      {formatStatusLabel(task.status)}
                    </Badge>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-[18px] font-poppins font-semibold text-heading leading-[23.76px] mb-[12px]">
                      Change Status
                    </h3>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full md:w-[413px] text-[16px] leading-[26.24px] bg-gray-50 text-[#667085] border-gray-200 px-[22px] py-[20px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-white">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              style={{ backgroundColor: "rgba(255, 76, 36, 0.15)" }}
              className="w-full md:w-[270px] cursor-pointer h-[62px] capitalize text-[18px] font-semibold leading-[29.52px] text-[#FF4C24] py-4"
              onClick={() => setShowDeleteModal(true)}
              disabled={updating}
              aria-label="Delete Task"
            >
              Delete Task
            </Button>
            <Button
              className="w-full cursor-pointer md:w-[270px] h-[62px] capitalize bg-primary text-[18px] font-semibold leading-[29.52px] text-heading py-4"
              onClick={handleStatusChange}
              disabled={updating || selectedStatus === task.status}
              aria-label="Submit Status Change"
            >
              {updating ? "Updating..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[100]" />
        <DialogContent className="fixed left-[50%] top-[50%] z-[101] w-full max-w-md translate-x-[-50%] translate-y-[-50%] border-0 p-0 bg-transparent shadow-none">
          <div className="bg-white rounded-2xl p-8 text-center relative shadow-lg">
            <div className="mb-6 flex justify-center">
            <Image src="/congratulations.png" width={350} height={250} alt="Task completed" />
            </div>

            <div className="space-y-4">
              <h3 className="text-[24px] font-poppins font-semibold text-heading mb-2">Successfully Completed the Task!</h3>
              <p className="text-[#737791] text-[18px] font-poppins mb-6">
              Congratulations! You have successfully completed the task.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[100]" />
        <DialogContent className="fixed left-[50%] top-[50%] z-[101] w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 bg-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Image src="/delete.png" width={350} height={250} alt="Delete confirmation" />
            

            <h3 className="text-[40px] font-poppins font-semibold text-heading mb-2">Are you Sure!!</h3>
            <p className="text-[#737791] text-[18px] font-poppins mb-6">
            Do you want to delete this Task on this app?
            </p>

            <div className="flex gap-5 w-[299px] h-[49px]">
              
              <Button
                onClick={handleDeleteTask}
                disabled={updating}
                className="flex-1 h-full cursor-pointer bg-primary hover:bg-primary/40 text-white"
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 cursor-pointer h-full border-gray-300 hover:bg-gray-50"
                disabled={updating}
              >
                No
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
