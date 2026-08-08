from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def process_payment(self, amount: float) -> dict:
        pass

class CashStrategy(PaymentStrategy):
    def process_payment(self, amount: float) -> dict:
        return {"status": "success", "message": "Pay cash upon pickup."}

class GCashStrategy(PaymentStrategy):
    def process_payment(self, amount: float) -> dict:
        # Mock integration with GCash API
        return {"status": "pending", "message": "Redirecting to GCash...", "checkout_url": "https://gcash.mock/checkout"}

class MayaStrategy(PaymentStrategy):
    def process_payment(self, amount: float) -> dict:
        return {"status": "pending", "message": "Redirecting to Maya...", "checkout_url": "https://maya.mock/checkout"}

class BankTransferStrategy(PaymentStrategy):
    def process_payment(self, amount: float) -> dict:
        return {"status": "success", "message": "Virtual Account details generated.", "account_no": "1234567890"}

class PaymentContext:
    def __init__(self, strategy: PaymentStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: PaymentStrategy):
        self._strategy = strategy

    def execute_payment(self, amount: float):
        return self._strategy.process_payment(amount)