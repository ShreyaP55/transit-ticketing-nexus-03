
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, TicketX, AlertCircle } from "lucide-react";
import { ticketsAPI, paymentAPI } from "@/services/api";
import { ITicket } from "@/types";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { TicketCard } from "@/components/tickets/TicketCard";
import { TicketSuccessDisplay } from "@/components/tickets/TicketSuccessDisplay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewTicketModal } from "@/components/tickets/NewTicketModal";
import { toast } from "sonner";

const TicketsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useUser();
  const [activeTab, setActiveTab] = useState("active");
  const [open, setOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<ITicket | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  // Handle successful payment confirmation
  useEffect(() => {
    const confirmPayment = async () => {
      if (status === "success" && sessionId && userId) {
        try {
          toast.info("Processing your payment...");
          
          const result = await paymentAPI.confirmPayment(sessionId);
          
          if (result.success && result.data?.ticket) {
            setNewTicket(result.data.ticket);
            setShowSuccess(true);
            toast.success("Ticket purchased successfully!");
            queryClient.invalidateQueries({ queryKey: ["tickets", userId] });
            
            // Auto-hide success message after 10 seconds
            setTimeout(() => setShowSuccess(false), 10000);
          } else {
            toast.error("Failed to process ticket purchase");
          }
          
          // Clean up URL params
          navigate("/tickets", { replace: true });
        } catch (error) {
          console.error("Payment confirmation error:", error);
          toast.error("Failed to confirm payment");
          navigate("/tickets", { replace: true });
        }
      } else if (status === "cancel") {
        toast.error("Payment was cancelled");
        navigate("/tickets", { replace: true });
      }
    };

    confirmPayment();
  }, [status, sessionId, userId, navigate, queryClient]);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: () => ticketsAPI.getByUserId(userId || ""),
    enabled: !!userId,
  });

  const activeTickets = tickets.filter(
    (ticket) => !ticket.isExpired && ticket.isActive
  );

  const expiredTickets = tickets.filter(
    (ticket) => ticket.isExpired || !ticket.isActive
  );

  const handleNewTicket = () => {
    setOpen(true);
  };

  return (
    <MainLayout title="My Tickets">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {showSuccess && newTicket && (
          <div className="mb-6">
            <TicketSuccessDisplay ticket={newTicket} />
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🎟️ My Tickets</h1>
            <p className="text-gray-600">Manage your bus tickets and travel history</p>
          </div>
          <Button onClick={handleNewTicket} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Book New Ticket
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger value="active" className="data-[state=active]:bg-white">
              Active Tickets ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-white">
              Expired Tickets ({expiredTickets.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-gray-500">Loading your tickets...</div>
              </div>
            ) : activeTickets.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-white shadow-sm">
                <TicketX className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Active Tickets</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  You don't have any active tickets at the moment. Book a new ticket to get started!
                </p>
                <Button onClick={handleNewTicket} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-gray-500">Loading expired tickets...</div>
              </div>
            ) : expiredTickets.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-white shadow-sm">
                <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Expired Tickets</h3>
                <p className="text-gray-500">
                  You don't have any expired tickets in your history.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {expiredTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <NewTicketModal open={open} onOpenChange={setOpen} />
    </MainLayout>
  );
};

export default TicketsPage;
